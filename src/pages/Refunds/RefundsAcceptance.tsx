/**
 * RefundsAcceptance.tsx
 * Description: Detailed view for reviewing, approving, or denying individual expense vouchers associated with a trip request.
 *              Includes a variance report section comparing approved budget vs. actual expenses.
 * Authors: Original Monarca team
 * Last Modification made:
 * 03/06/2026 [Nicolas Quintana] Added format to comments.
*/

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRequest } from "../../utils/apiService";
import formatMoney from "../../utils/formatMoney";
import formatDate from "../../utils/formatDate";
import GoBack from "../../components/GoBack";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import FilePreviewer from "../../components/Refunds/FilePreviewer";
import { patchRequest } from "../../utils/apiService";
import { Tutorial } from "../../components/Tutorial";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { toast } from "react-toastify";
import { useApp } from "../../hooks/app/appContext";

/**
 * RequestData
 * Interface defining the structure of the detailed trip request and its associated vouchers.
 */

interface RequestData {
  id?: string;
  admin?: string;
  id_origin_city?: string;
  destinations?: string;
  motive?: string;
  advance_money?: string | number;
  status?: string;
  requirements?: string;
  priority?: string;
  createdAt?: string;
  advance_money_str?: string;
  destination?: {
    city?: string;
    iata_code?: string;
  };
  requests_destinations?: Array<{
    destination: {
      city?: string;
      iata_code?: string;
    };
  }>;
  vouchers?: Array<{
    id: string;
    file_url_pdf: string;
    file_url_xml: string;
    status: string;
    class: string;
    amount: number;
    unconverted_amount: number | null;
    currency: string;
    exchange_rate: number | null;
    date: string;
  }>;
}

/**
 * Dest
 * Interface for destination mapping.
 */
interface Dest {
  destination: {
    city?: string;
    iata_code?: string;
  };
}

/**
 * FunctionName: renderStatus, transforms the technical status string into a readable format.
 * Input: status (string) - Raw status from backend.
 * Output: string - Formatted status text.
 */
export const renderStatus = (status: string, t: TFunction) => {
  switch (status) {
    case "Pending Review": return t('status.pendingReview');
    case "Denied": return t('status.denied');
    case "Cancelled": return t('status.cancelled');
    case "Changes Needed": return t('status.changesNeeded');
    case "Pending Reservations": return t('status.pendingReservations');
    case "Pending Accounting Approval": return t('status.pendingAccountingApproval');
    case "Pending Vouchers Approval": return t('status.pendingVouchersApproval');
    case "In Progress": return t('status.inProgress');
    case "Pending Refund Approval": return t('status.pendingRefundApproval');
    case "Completed": return t('status.completed');
    default: return status;
  }
}

/**
 * FunctionName: RefundsAcceptance, main component for individual voucher validation.
 * Input: None (React Functional Component)
 * Output: JSX.Element - The rendered component.
 */
const RefundsAcceptance: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RequestData>({});
  const [_loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const { handleVisitPage, tutorial } = useApp();

  /**
   * FunctionName: fetchData, retrieves the complete trip request data including associated vouchers.
   * Input: None (Uses ID from URL params)
   * Output: Promise<void>
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getRequest(`/requests/${id}`);
        console.log("Response from API:", response);
        setData({
          ...response,
          createdAt: formatDate(response.createdAt),
          advance_money_str: formatMoney(response.advance_money),
          admin: response.admin.name + " " + response.admin.last_name,
          id_origin_city:
            response.destination?.city ||
            response.destination?.iata_code ||
            t('refundAcceptance.originCity'),
          destinations: (response.requests_destinations || [])
            .map(
              (dest: Dest) =>
                dest.destination?.city ||
                dest.destination?.iata_code ||
                t('refundAcceptance.destinations'),
            )
            .join(", "),
        });
      } catch (error) {
        console.error("Error fetching request data:", error);
      } finally {
        setLoading(false);
        console.log("Data fetched successfully");
      }
    };

    fetchData();
  }, [id]);

  /**
   * Tracks page visits for the tutorial system.
   */
  useEffect(() => {
    const visitedPages = JSON.parse(localStorage.getItem("visitedPages") || "[]");
    const isPageVisited = visitedPages.includes(location.pathname);

    if (!isPageVisited) {
    }
    handleVisitPage();
  }, []);

  const labels: { key: keyof RequestData; label: string }[] = [
    { key: "id", label: t('refundAcceptance.requestId') },
    { key: "admin", label: t('refundAcceptance.approver') },
    { key: "id_origin_city", label: t('refundAcceptance.originCity') },
    { key: "destinations", label: t('refundAcceptance.destinations') },
    { key: "motive", label: t('refundAcceptance.motive') },
    { key: "advance_money_str", label: t('refundAcceptance.advance') },
    { key: "status", label: t('refundAcceptance.status') },
    { key: "requirements", label: t('refundAcceptance.requirements') },
    { key: "priority", label: t('refundAcceptance.priority') },
    { key: "createdAt", label: t('refundAcceptance.createdAt') },
  ];

  /**
   * FunctionName: approveVoucher, updates a single voucher status to approved via API.
   * Input: voucherId (string)
   * Output: Promise<void>
   */
  const approveVoucher = async (id: string) => {
    try {
      await patchRequest(`/vouchers/${id}/approve`, {});
      const updatedVouchers = data?.vouchers?.map((voucher) => {
        if (voucher.id === id) {
          return { ...voucher, status: "Voucher Approved" };
        }
        return voucher;
      });
      setData({ ...data, vouchers: updatedVouchers });
    }
    catch (error) {
      console.error("Error approving voucher:", error);
    }
  }

  /**
   * FunctionName: denyVoucher, updates a single voucher status to denied via API.
   * Input: voucherId (string)
   * Output: Promise<void>
   */
  const denyVoucher = async (id: string) => {
    try {
      await patchRequest(`/vouchers/${id}/deny`, {});
      const updatedVouchers = data?.vouchers?.map((voucher) => {
        if (voucher.id === id) {
          return { ...voucher, status: "Voucher Denied" };
        }
        return voucher;
      });
      setData({ ...data, vouchers: updatedVouchers });
    } catch (error) {
      console.error("Error denying voucher:", error);
    }
  }

  /**
   * FunctionName: completeRequest, finalizes the verification process for the entire request.
   * Input: None
   * Output: Promise<void>
   */
  const completeRequest = async () => {
    try {
      await patchRequest(`/requests/finished-approving-vouchers/${id}`, {});
      toast.success(t('refundAcceptance.verificationComplete'));
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing request:", error);
      toast.error(t('refundAcceptance.errorCompleting'));
    }
  };
  return (
    <Tutorial page="refundReview" run={tutorial}>
      <div className="pb-10">
        <GoBack />
        <main className="max-w-6xl bg-[var(--color-card-bg)] mx-auto rounded-lg shadow-lg overflow-hidden">
          <div className="px-8 py-10 flex flex-col">
            <div className="w-fit bg-[var(--blue)] text-white px-4 py-2 rounded-full mb-6">
              {t('refundAcceptance.requestInfoLabel')} <span>{id}</span>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8" id="request-info">
              {labels.map(({ key, label }) => (
                <div key={key}>
                  <label
                    htmlFor={key}
                    className="block text-xs font-semibold text-gray-500 mb-1"
                  >
                    {label}
                  </label>

                  {key === 'status' ? (
                    <input
                      id={key}
                      type="text"
                      readOnly
                      value={data[key] !== undefined ? String(renderStatus(data.status ?? '', t)) : ""}
                      className="w-full bg-[var(--color-card-bg)] border border-[var(--color-border)] text-[var(--color-page-text)] rounded-lg px-3 py-2"
                    />

                  ) : (
                    <input
                      id={key}
                      type="text"
                      readOnly
                      value={data[key] !== undefined ? String(data[key]) : ""}
                      className="w-full bg-[var(--color-card-bg)] border border-[var(--color-border)] text-[var(--color-page-text)] rounded-lg px-3 py-2"
                    />
                  )}
                </div>
              ))}
            </section>


            <div className="mb-4">
              <div className="bg-[var(--color-page-bg)] border border-[var(--color-border)] text-[var(--color-page-text)] p-4 rounded-lg shadow-md" id="vouchers">
                <section className="mb-10">
                  <h1 className="text-2xl font-bold text-[var(--color-page-text-title)] mb-4">
                    {t('refundAcceptance.importantInfo')}
                  </h1>
                  <p className="text-sm text-gray-500">
                    - {t('refundAcceptance.instruction1')}
                  </p>
                  <p className="text-sm text-gray-500">
                    - {t('refundAcceptance.instruction2')}
                  </p>
                </section>
                <h2 className="text-lg font-semibold text-[var(--color-page-text)] mb-4">
                  {t('refundAcceptance.voucher')} {currentIndex + 1} {t('refundAcceptance.of')}{" "}
                  {data?.vouchers?.length}
                </h2>
                {/* Display the existing PDF using an iframe */}
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={50}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  onBeforeInit={(swiper: any) => {
                    if (typeof swiper.params.navigation !== 'boolean') {
                      swiper.params.navigation.prevEl = prevRef.current;
                      swiper.params.navigation.nextEl = nextRef.current;
                    }
                  }}
                  onSlideChange={(swiper: any) => setCurrentIndex(swiper.activeIndex)}
                >
                  {data?.vouchers?.map((file, index) => (
                    <SwiperSlide key={index}>
                      <FilePreviewer
                        file={file}
                        fileIndex={index}
                        showDownload={false}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                  <button
                    ref={prevRef}
                    disabled={currentIndex === 0}
                    className={`px-4 py-2 rounded-md hover:cursor-pointer ${currentIndex === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                      }`}
                  >
                    {t('refundAcceptance.previous')}
                  </button>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={async () => {
                        const url = data?.vouchers?.[currentIndex]?.file_url_xml;
                        if (!url) return;
                        const response = await fetch(url);
                        const blob = await response.blob();
                        const objUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = objUrl;
                        link.download = `comprobante${currentIndex + 1}.xml`;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(objUrl);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                    >
                      {t('refundAcceptance.downloadXml')}
                    </button>
                    <button
                      onClick={async () => {
                        const url = data?.vouchers?.[currentIndex]?.file_url_pdf;
                        if (!url) return;
                        const response = await fetch(url);
                        const blob = await response.blob();
                        const objUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = objUrl;
                        link.download = `comprobante${currentIndex + 1}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(objUrl);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
                    >
                      {t('refundAcceptance.downloadPdf')}
                    </button>
                    <button
                      disabled={data?.vouchers?.[currentIndex]?.status !== "pending_voucher"}
                      className={`px-4 py-2 text-white rounded-md hover:cursor-pointer ${data?.vouchers?.[currentIndex]?.status !== "pending_voucher"
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                        }`}
                      onClick={() => approveVoucher(data?.vouchers?.[currentIndex]?.id ?? "")}
                      id="approve-button"
                    >
                      {t('refundAcceptance.approve')}
                    </button>
                    <button
                      disabled={data?.vouchers?.[currentIndex]?.status !== "pending_voucher"}
                      className={`px-4 py-2 text-white rounded-md hover:cursor-pointer ${data?.vouchers?.[currentIndex]?.status !== "pending_voucher"
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                        }`}
                      onClick={() => denyVoucher(data?.vouchers?.[currentIndex]?.id ?? "")}
                      id="deny-button"
                    >
                      {t('refundAcceptance.deny')}
                    </button>
                  </div>
                  <button
                    disabled={currentIndex === ((data?.vouchers?.length ?? 0) - 1)}
                    ref={nextRef}
                    className={`px-4 py-2 rounded-md hover:cursor-pointer ${currentIndex === (data?.vouchers?.length ?? 0) - 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                      }`}
                    id="next-voucher"
                  >
                    {t('refundAcceptance.next')}
                  </button>
                </div>
              </div>
              <section className="grid grid-cols-3 gap-5" id="refund-review">
                <div className="my-5">
                  <label
                    htmlFor={"total"}
                    className="block text-xs font-semibold text-gray-500 mb-1"
                  >
                    {t('refundAcceptance.totalVouchers')}
                  </label>
                  <input
                    id={"total"}
                    type="text"
                    readOnly
                    value={formatMoney(data?.vouchers?.reduce((acc: number, file: { status: string; amount: number }) => {
                      if (file.status === "Voucher Approved") {
                        return acc + +file.amount;
                      }
                      return acc;
                    }, 0) ?? 0)}
                    className="w-full bg-[var(--color-card-bg)] border border-[var(--color-border)] text-[var(--color-page-text)] rounded-lg px-3 py-2"
                  />
                </div>
                <div className="my-5">
                  <label
                    htmlFor={"advance_money"}
                    className="block text-xs font-semibold text-gray-500 mb-1"
                  >
                    {t('refundAcceptance.advance')}
                  </label>
                  <input
                    id={"advance_money"}
                    type="text"
                    readOnly
                    value={formatMoney(Number(data?.advance_money) || 0)}
                    className="w-full bg-[var(--color-card-bg)] border border-[var(--color-border)] text-[var(--color-page-text)] rounded-lg px-3 py-2"
                  />
                </div>
                <div className="my-5">
                  <label
                    htmlFor={"total"}
                    className="block text-xs font-semibold text-gray-500 mb-1"
                  >
                    {t('refundAcceptance.total')}
                  </label>
                  <input
                    id={"total"}
                    type="text"
                    readOnly
                    value={formatMoney(
                      (typeof data?.advance_money === "number" ? data.advance_money : Number(data?.advance_money) || 0)
                      - (data?.vouchers?.reduce((acc: number, file: { status: string; amount: number }) => {
                        if (file.status === "Voucher Approved") {
                          return acc + Number(file.amount);
                        }
                        return acc;
                      }, 0) ?? 0)
                    )}
                    className="w-full bg-[var(--color-card-bg)] border border-[var(--color-border)] text-[var(--color-page-text)] rounded-lg px-3 py-2"
                  />
                </div>

              </section>

              {data?.vouchers && data.vouchers.length > 0 && (() => {
                const actualAmount = data.vouchers!.reduce(
                  (acc, v) => v.status === "Voucher Approved" ? acc + Number(v.amount) : acc, 0
                );
                const budgetAmount = Number(data.advance_money ?? 0);
                const variance = actualAmount - budgetAmount;
                const variancePct = budgetAmount > 0
                  ? Math.round((variance / budgetAmount) * 10000) / 100
                  : null;
                return (
                  <section
                    className="my-5 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)]"
                    id="variance-report"
                  >
                    <h2 className="text-lg font-semibold text-[var(--color-page-text-title)] mb-4">
                      {t('refundAcceptance.varianceReport')}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          {t('refundAcceptance.budgetAmount')}
                        </p>
                        <p className="font-medium text-[var(--color-page-text)]">
                          {formatMoney(budgetAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          {t('refundAcceptance.actualAmount')}
                        </p>
                        <p className="font-medium text-[var(--color-page-text)]">
                          {formatMoney(actualAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          {t('refundAcceptance.variance')}
                        </p>
                        <p className={`font-semibold ${variance > 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {variance > 0 ? '+' : ''}{formatMoney(variance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          {t('refundAcceptance.variancePct')}
                        </p>
                        <p className={`font-semibold ${(variancePct ?? 0) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {variancePct !== null
                            ? `${variancePct > 0 ? '+' : ''}${variancePct.toFixed(2)}%`
                            : 'N/A'}
                          <span className="ml-2 text-xs font-normal">
                            {(variancePct ?? 0) > 0
                              ? t('refundAcceptance.overBudget')
                              : t('refundAcceptance.underBudget')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </section>
                );
              })()}

              <div className="flex space-x-4 justify-end mt-6">
                <button
                  className={`px-4 py-2 text-white rounded-md hover:cursor-pointer
                      ${data?.vouchers?.some((file) => file.status === "pending_voucher")
                      ? "bg-[var(--color-button)] text-[var(--color-text-button)] cursor-not-allowed"
                      : "bg-[var(--blue)] hover:bg-[var(--dark-blue)]"
                    }`}
                  disabled={data?.vouchers?.some((file) => file.status === "pending_voucher")}
                  onClick={completeRequest}
                  id="complete-refund"
                >
                  {t('refundAcceptance.finishVerification')}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Tutorial>
  );
};

export default RefundsAcceptance;
