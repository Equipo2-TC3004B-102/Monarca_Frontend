/**
 * FileName: Tutorial.tsx
 * Description: Tutorial component for the application.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 06/05/2026 [Sergio Jiawei Xuan] Converted tutorial step arrays to use i18n t() calls; translated driver.js navigation button labels.
 */

import { driver } from "driver.js";
import { useEffect } from "react";
import { useApp } from "../hooks/app/appContext";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

const getDashboardSteps = (t: TFunction) => [
  {
    element: "#create-request",
    popover: {
      title: t('tutorial.dashboard.createRequest'),
      description: t('tutorial.dashboard.createRequestDesc'),
      position: "bottom",
    },
  },
  {
    element: "#history",
    popover: {
      title: t('tutorial.dashboard.travelHistory'),
      description: t('tutorial.dashboard.travelHistoryDesc'),
      position: "bottom",
    },
  },
  {
    element: "#upload_vouchers",
    popover: {
      title: t('tutorial.dashboard.checkExpenses'),
      description: t('tutorial.dashboard.checkExpensesDesc'),
      position: "bottom",
    },
  },
  {
    element: "#approve_request",
    popover: {
      title: t('tutorial.dashboard.tripsToApprove'),
      description: t('tutorial.dashboard.tripsToApproveDesc'),
      position: "bottom",
    },
  },
  {
    element: "#approved_requests",
    popover: {
      title: t('tutorial.dashboard.approvedHistory'),
      description: t('tutorial.dashboard.approvedHistoryDesc'),
      position: "bottom",
    },
  },
  {
    element: "#approve_vouchers",
    popover: {
      title: t('tutorial.dashboard.vouchersToApprove'),
      description: t('tutorial.dashboard.vouchersToApproveDesc'),
      position: "bottom",
    },
  },
  {
    element: "#check_budgets",
    popover: {
      title: t('tutorial.dashboard.tripsToRegister'),
      description: t('tutorial.dashboard.tripsToRegisterDesc'),
      position: "bottom",
    },
  },
  {
    element: "#check_refunds",
    popover: {
      title: t('tutorial.dashboard.refundsToRegister'),
      description: t('tutorial.dashboard.refundsToRegisterDesc'),
      position: "bottom",
    },
  },
  {
    element: "#bookings",
    popover: {
      title: t('tutorial.dashboard.tripsToBook'),
      description: t('tutorial.dashboard.tripsToBookDesc'),
      position: "bottom",
    },
  },
  {
    element: "#reserved_requests",
    popover: {
      title: t('tutorial.dashboard.reservedHistory'),
      description: t('tutorial.dashboard.reservedHistoryDesc'),
      position: "bottom",
    },
  },
];

const getCreateRequestSteps = (t: TFunction) => [
  {
    element: "#travel_request_info",
    popover: {
      title: t('tutorial.createRequest.generalInfo'),
      description: "",
      position: "bottom",
    },
  },
  {
    element: "#destination_info",
    popover: {
      title: t('tutorial.createRequest.destinationInfo'),
      description: "",
      position: "bottom",
    },
  },
  {
    element: "#new_destination",
    popover: {
      title: t('tutorial.createRequest.addDestinations'),
      description: "",
      position: "bottom",
    },
  },
  {
    element: "#create_travel_request",
    popover: {
      title: t('tutorial.createRequest.createTrip'),
      description: "",
      position: "bottom",
    },
  },
];

const getHistorySteps = (t: TFunction) => [
  {
    element: "#list_requests",
    popover: {
      title: t('tutorial.history.requestList'),
      description: t('tutorial.history.requestListDesc'),
      position: "bottom",
    },
  },
];

const getRefundsSteps = (t: TFunction) => [
  {
    element: "#list_requests",
    popover: {
      title: t('tutorial.refunds.requestList'),
      description: t('tutorial.refunds.requestListDesc'),
      position: "bottom",
    },
  },
];

const getApprovalsSteps = (t: TFunction) => [
  {
    element: "#list_requests",
    popover: {
      title: t('tutorial.approvals.requestList'),
      description: t('tutorial.approvals.requestListDesc'),
      position: "bottom",
    },
  },
];

const getRefundsReviewSteps = (t: TFunction) => [
  {
    element: "#list_requests",
    popover: {
      title: t('tutorial.refundsReview.requestList'),
      description: t('tutorial.refundsReview.requestListDesc'),
      position: "bottom",
    },
  },
];

const getBookingsSteps = (t: TFunction) => [
  {
    element: "#list_requests",
    popover: {
      title: t('tutorial.bookings.requestList'),
      description: t('tutorial.bookings.requestListDesc'),
      position: "bottom",
    },
  },
];

const getCheckRefundsSteps = (t: TFunction) => [
  {
    element: "#list_requests",
    popover: {
      title: t('tutorial.checkRefunds.requestList'),
      description: t('tutorial.checkRefunds.requestListDesc'),
      position: "bottom",
    },
  },
];

const getVouchersSteps = (t: TFunction) => [
  {
    element: "#vouchers",
    popover: {
      title: t('tutorial.vouchers.expenses'),
      description: t('tutorial.vouchers.expensesDesc'),
      position: "bottom",
    },
  },
  {
    element: "#submit-refund",
    popover: {
      title: t('tutorial.vouchers.submit'),
      description: t('tutorial.vouchers.submitDesc'),
      position: "bottom",
    },
  },
];

const getAssignReservationSteps = (t: TFunction) => [
  {
    element: "#reservation-info",
    popover: {
      title: t('tutorial.reservations.destinationInfo'),
      description: t('tutorial.reservations.destinationInfoDesc'),
      position: "bottom",
    },
  },
  {
    element: "#hotel-reservation",
    popover: {
      title: t('tutorial.reservations.hotelReservation'),
      description: t('tutorial.reservations.hotelReservationDesc'),
      position: "bottom",
    },
  },
  {
    element: "#plane-reservation",
    popover: {
      title: t('tutorial.reservations.flightReservation'),
      description: t('tutorial.reservations.flightReservationDesc'),
      position: "bottom",
    },
  },
  {
    element: "#assign-reservations",
    popover: {
      title: t('tutorial.reservations.assignReservations'),
      description: t('tutorial.reservations.assignReservationsDesc'),
      position: "bottom",
    },
  },
];

const getRefundReviewSteps = (t: TFunction) => [
  {
    element: "#request-info",
    popover: {
      title: t('tutorial.refundReview.requestInfo'),
      description: t('tutorial.refundReview.requestInfoDesc'),
      position: "bottom",
    },
  },
  {
    element: "#vouchers",
    popover: {
      title: t('tutorial.refundReview.vouchersInfo'),
      description: t('tutorial.refundReview.vouchersInfoDesc'),
      position: "bottom",
    },
  },
  {
    element: "#next-voucher",
    popover: {
      title: t('tutorial.refundReview.nextVoucher'),
      description: t('tutorial.refundReview.nextVoucherDesc'),
      position: "bottom",
    },
  },
  {
    element: "#deny-button",
    popover: {
      title: t('tutorial.refundReview.denyVoucher'),
      description: t('tutorial.refundReview.denyVoucherDesc'),
      position: "bottom",
    },
  },
  {
    element: "#approve-button",
    popover: {
      title: t('tutorial.refundReview.approveVoucher'),
      description: t('tutorial.refundReview.approveVoucherDesc'),
      position: "bottom",
    },
  },
  {
    element: "#refund-review",
    popover: {
      title: t('tutorial.refundReview.refundSummary'),
      description: t('tutorial.refundReview.refundSummaryDesc'),
      position: "bottom",
    },
  },
  {
    element: "#complete-refund",
    popover: {
      title: t('tutorial.refundReview.complete'),
      description: t('tutorial.refundReview.completeDesc'),
      position: "bottom",
    },
  },
];

const getRequestInfoSteps = (t: TFunction) => [
  {
    element: "#request-info",
    popover: {
      title: t('tutorial.requestInfo.requestInfo'),
      description: t('tutorial.requestInfo.requestInfoDesc'),
      position: "bottom",
    },
  },
  {
    element: "#destinations-info",
    popover: {
      title: t('tutorial.requestInfo.destinationsInfo'),
      description: t('tutorial.requestInfo.destinationsInfoDesc'),
      position: "bottom",
    },
  },
  {
    element: "#revisions-info",
    popover: {
      title: t('tutorial.requestInfo.revisionsInfo'),
      description: t('tutorial.requestInfo.revisionsInfoDesc'),
      position: "bottom",
    },
  },
  {
    element: "#vouchers-info",
    popover: {
      title: t('tutorial.requestInfo.vouchersInfo'),
      description: t('tutorial.requestInfo.vouchersInfoDesc'),
      position: "bottom",
    },
  },
  {
    element: "#travel-agency",
    popover: {
      title: t('tutorial.requestInfo.travelAgency'),
      description: t('tutorial.requestInfo.travelAgencyDesc'),
      position: "bottom",
    },
  },
  {
    element: "#comment-section",
    popover: {
      title: t('tutorial.requestInfo.comments'),
      description: t('tutorial.requestInfo.commentsDesc'),
      position: "bottom",
    },
  },
  {
    element: "#edit-request-button",
    popover: {
      title: t('tutorial.requestInfo.edit'),
      description: t('tutorial.requestInfo.editDesc'),
      position: "bottom",
    },
  },
  {
    element: "#cancel-request-button",
    popover: {
      title: t('tutorial.requestInfo.cancel'),
      description: t('tutorial.requestInfo.cancelDesc'),
      position: "bottom",
    },
  },
  {
    element: "#approve-request-button",
    popover: {
      title: t('tutorial.requestInfo.approve'),
      description: t('tutorial.requestInfo.approveDesc'),
      position: "bottom",
    },
  },
  {
    element: "#changes-request-button",
    popover: {
      title: t('tutorial.requestInfo.requestChanges'),
      description: t('tutorial.requestInfo.requestChangesDesc'),
      position: "bottom",
    },
  },
  {
    element: "#deny-request-button",
    popover: {
      title: t('tutorial.requestInfo.deny'),
      description: t('tutorial.requestInfo.denyDesc'),
      position: "bottom",
    },
  },
];

interface TutorialProps {
   children: React.ReactNode;
   page: "dashboard" | "createRequest" | "history" | "refunds" | "vouchers" | "approvals" | "refundsReview" | "bookings" | "assignReservation" | "reservations" | "checkRefunds" | "refundReview" | "requestInfo";
   run?: boolean;
  }

  /**
* FunctionName: Tutorial
 * Purpose of the function: to display the tutorial for the application.
 * Input: values on the input
 * Output: returned values
 * Author: Original Moncarca team
 * Last Modification made: original Moncarca team
 */
export const Tutorial = ({ children, page, run = false }: TutorialProps) => {
  const { setTutorial } = useApp();
  const { t } = useTranslation();

  useEffect(() => {
    if (!run) return;
    const timeout = setTimeout(() => {
      const stepsMap: Record<string, ReturnType<typeof getDashboardSteps>> = {
        dashboard: getDashboardSteps(t),
        createRequest: getCreateRequestSteps(t),
        history: getHistorySteps(t),
        refunds: getRefundsSteps(t),
        vouchers: getVouchersSteps(t),
        approvals: getApprovalsSteps(t),
        refundsReview: getRefundsReviewSteps(t),
        bookings: getBookingsSteps(t),
        reservations: getAssignReservationSteps(t),
        checkRefunds: getCheckRefundsSteps(t),
        refundReview: getRefundReviewSteps(t),
        requestInfo: getRequestInfoSteps(t),
      };

      const steps = stepsMap[page] || getDashboardSteps(t);
      const filteredSteps = steps.filter(step => {
        if (!step.element) return false;
        const el = document.querySelector(step.element);
        return Boolean(el);
      });
      if (filteredSteps.length === 0) {
        console.warn("No valid steps found for the tutorial.");
        return;
      }
      const drv = driver({
          doneBtnText: t('tutorial.done'),
          nextBtnText: t('tutorial.next'),
          prevBtnText: t('tutorial.previous'),
          animate: true,
          allowClose: true,
      });
      drv.setSteps(filteredSteps);
      drv.drive();
      setTutorial(false);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [run]);
  return children;
};
