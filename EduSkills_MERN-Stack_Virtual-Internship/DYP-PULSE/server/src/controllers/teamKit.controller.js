import TeamKitRequest from '../models/TeamKitRequest.js';
import {
  sendTeamKitConfirmationEmail,
  sendTeamKitStatusUpdateEmail
} from '../services/email.service.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Submit a new team kit custom request
 * POST /api/v1/team-kits
 */
export const createRequest = async (req, res, next) => {
  try {
    const {
      sport,
      kitType,
      teamInfo,
      design,
      sizeBreakdown = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
      additionalRequirements = {}
    } = req.body;

    // Validation
    if (!sport || !kitType) {
      return next(new AppError('Sport and kit type are required', 400, 'MISSING_SPORT_OR_KIT_TYPE'));
    }

    if (!teamInfo || !teamInfo.teamName || !teamInfo.organization || !teamInfo.contactPerson || !teamInfo.contactEmail) {
      return next(
        new AppError(
          'Complete team info (teamName, organization, contactPerson, contactEmail) is required',
          400,
          'MISSING_TEAM_INFO'
        )
      );
    }

    if (!design || !design.primaryColor || !design.jerseyStyle) {
      return next(
        new AppError('Primary color and jersey style are required design preferences', 400, 'MISSING_DESIGN_PREFS')
      );
    }

    // Calculate total quantity from size breakdown
    const parsedSizes = {
      XS: Math.max(0, parseInt(sizeBreakdown.XS, 10) || 0),
      S: Math.max(0, parseInt(sizeBreakdown.S, 10) || 0),
      M: Math.max(0, parseInt(sizeBreakdown.M, 10) || 0),
      L: Math.max(0, parseInt(sizeBreakdown.L, 10) || 0),
      XL: Math.max(0, parseInt(sizeBreakdown.XL, 10) || 0),
      XXL: Math.max(0, parseInt(sizeBreakdown.XXL, 10) || 0)
    };

    const calculatedTotal =
      parsedSizes.XS + parsedSizes.S + parsedSizes.M + parsedSizes.L + parsedSizes.XL + parsedSizes.XXL;

    const totalQuantity = calculatedTotal > 0 ? calculatedTotal : Math.max(1, parseInt(req.body.totalQuantity, 10) || 1);

    const kitRequest = new TeamKitRequest({
      user: req.user._id,
      sport,
      kitType,
      teamInfo: {
        teamName: teamInfo.teamName.trim(),
        organization: teamInfo.organization.trim(),
        contactPerson: teamInfo.contactPerson.trim(),
        contactEmail: teamInfo.contactEmail.trim().toLowerCase(),
        contactPhone: (teamInfo.contactPhone || req.user.phone || '').trim()
      },
      design: {
        primaryColor: design.primaryColor.trim(),
        secondaryColor: (design.secondaryColor || '').trim(),
        accentColor: (design.accentColor || '').trim(),
        jerseyStyle: design.jerseyStyle.trim(),
        logoUrl: (design.logoUrl || '').trim(),
        referenceImageUrl: (design.referenceImageUrl || '').trim(),
        rosterNotes: (design.rosterNotes || '').trim()
      },
      sizeBreakdown: parsedSizes,
      totalQuantity,
      additionalRequirements: {
        desiredDeliveryDate: additionalRequirements.desiredDeliveryDate
          ? new Date(additionalRequirements.desiredDeliveryDate)
          : null,
        instructions: (additionalRequirements.instructions || '').trim()
      },
      status: 'Submitted',
      statusHistory: [
        {
          status: 'Submitted',
          changedBy: req.user._id,
          note: 'Customization request submitted by customer',
          changedAt: new Date()
        }
      ]
    });

    await kitRequest.save();

    // Trigger Team Kit Confirmation Email
    sendTeamKitConfirmationEmail({
      request: kitRequest,
      recipientEmail: kitRequest.teamInfo?.contactEmail || req.user.email
    }).catch((e) => console.error('[Team Kit Confirmation Email Error]:', e.message));

    res.status(201).json({
      success: true,
      message: 'Team kit request submitted successfully',
      data: {
        request: kitRequest
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current customer's team kit requests
 * GET /api/v1/team-kits/my-requests
 */
export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await TeamKitRequest.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        requests,
        count: requests.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific team kit request by ID or Reference
 * GET /api/v1/team-kits/:id
 */
export const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let request;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      request = await TeamKitRequest.findById(id).populate('user', 'firstName lastName email phone');
    } else {
      request = await TeamKitRequest.findOne({ requestReference: id }).populate(
        'user',
        'firstName lastName email phone'
      );
    }

    if (!request) {
      return next(new AppError('Team kit request not found', 404, 'REQUEST_NOT_FOUND'));
    }

    // Authorization: User must be owner or admin
    if (request.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to access this customization request', 403, 'FORBIDDEN'));
    }

    res.status(200).json({
      success: true,
      data: {
        request
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a team kit request (Customer)
 * POST /api/v1/team-kits/:id/cancel
 */
export const cancelRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by captain' } = req.body;

    const request = await TeamKitRequest.findById(id);
    if (!request) {
      return next(new AppError('Team kit request not found', 404, 'REQUEST_NOT_FOUND'));
    }

    // Ownership check
    if (request.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to cancel this request', 403, 'FORBIDDEN'));
    }

    // Validation: only Submitted or Under Review can be cancelled by customer
    if (!['Submitted', 'Under Review'].includes(request.status)) {
      return next(
        new AppError(
          `Request cannot be cancelled because it is already '${request.status}'. Please contact studio management.`,
          400,
          'CANCELLATION_DISALLOWED'
        )
      );
    }

    request.status = 'Cancelled';
    request.statusHistory.push({
      status: 'Cancelled',
      changedBy: req.user._id,
      note: `Cancelled by customer: ${reason.trim()}`,
      changedAt: new Date()
    });

    await request.save();

    res.status(200).json({
      success: true,
      message: 'Team kit request cancelled',
      data: {
        request
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all team kit requests (Admin)
 * GET /api/v1/team-kits/admin/all
 */
export const getAllRequests = async (req, res, next) => {
  try {
    const { status, sport, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (sport && sport !== 'ALL') {
      filter.sport = sport;
    }
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { requestReference: searchRegex },
        { 'teamInfo.teamName': searchRegex },
        { 'teamInfo.organization': searchRegex },
        { 'teamInfo.contactEmail': searchRegex },
        { 'teamInfo.contactPerson': searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      TeamKitRequest.find(filter)
        .populate('user', 'firstName lastName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      TeamKitRequest.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update request status (Admin)
 * PUT /api/v1/team-kits/admin/:id/status
 */
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note = '', adminNotes = '' } = req.body;

    const request = await TeamKitRequest.findById(id);
    if (!request) {
      return next(new AppError('Team kit request not found', 404, 'REQUEST_NOT_FOUND'));
    }

    const validStatuses = [
      'Submitted',
      'Under Review',
      'Quotation Prepared',
      'Approved',
      'In Production',
      'Completed',
      'Rejected',
      'Cancelled'
    ];

    if (status) {
      if (!validStatuses.includes(status)) {
        return next(
          new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400, 'INVALID_STATUS')
        );
      }

      request.status = status;
      request.statusHistory.push({
        status,
        changedBy: req.user._id,
        note: note.trim() || `Status updated to ${status} by admin`,
        changedAt: new Date()
      });
    }

    if (adminNotes !== undefined) {
      request.adminNotes = adminNotes.trim();
    }

    await request.save();

    if (status) {
      sendTeamKitStatusUpdateEmail({
        request,
        recipientEmail: request.teamInfo?.contactEmail,
        newStatus: request.status,
        note: note ? note.trim() : ''
      }).catch((e) => console.error('[Team Kit Status Email Error]:', e.message));
    }

    res.status(200).json({
      success: true,
      message: `Request status updated to ${request.status}`,
      data: {
        request
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record quotation details (Admin)
 * PUT /api/v1/team-kits/admin/:id/quotation
 */
export const recordQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estimatedPrice, pricePerUnit, notes = '' } = req.body;

    const request = await TeamKitRequest.findById(id);
    if (!request) {
      return next(new AppError('Team kit request not found', 404, 'REQUEST_NOT_FOUND'));
    }

    const estimatedPriceInPaise =
      estimatedPrice != null ? Math.round(Number(estimatedPrice) * 100) : null;
    const pricePerUnitInPaise =
      pricePerUnit != null ? Math.round(Number(pricePerUnit) * 100) : null;

    request.quotation = {
      estimatedPriceInPaise,
      pricePerUnitInPaise,
      notes: notes.trim(),
      preparedAt: new Date()
    };

    request.status = 'Quotation Prepared';
    request.statusHistory.push({
      status: 'Quotation Prepared',
      changedBy: req.user._id,
      note: `Official quotation prepared: ₹${estimatedPrice || 0} (${notes})`,
      changedAt: new Date()
    });

    await request.save();

    // Trigger quotation status email to team contact
    sendTeamKitStatusUpdateEmail({
      request,
      recipientEmail: request.teamInfo?.contactEmail,
      newStatus: request.status,
      note: notes ? notes.trim() : 'Official quotation prepared'
    }).catch((e) => console.error('[Team Kit Quotation Email Error]:', e.message));

    res.status(200).json({
      success: true,
      message: 'Quotation details recorded successfully',
      data: {
        request
      }
    });
  } catch (error) {
    next(error);
  }
};
