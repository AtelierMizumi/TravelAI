package com.travelai.core.dto.response;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

public class BookingAuditStatsResponse {

    private long totalBookings;
    private BigDecimal totalRevenue;
    private String formattedTotalRevenue;
    private BigDecimal tourRevenue;
    private String formattedTourRevenue;
    private BigDecimal hotelRevenue;
    private String formattedHotelRevenue;
    private long pendingCount;
    private long confirmedCount;
    private long paidCount;
    private long completedCount;
    private long cancelledCount;
    private long totalPayments;
    private long reconciledPayments;
    private double reconciliationRate;

    public BookingAuditStatsResponse() {
    }

    public BookingAuditStatsResponse(long totalBookings, BigDecimal totalRevenue, BigDecimal tourRevenue,
                                     BigDecimal hotelRevenue, long pendingCount, long confirmedCount,
                                     long paidCount, long completedCount, long cancelledCount,
                                     long totalPayments, long reconciledPayments, double reconciliationRate) {
        this.totalBookings = totalBookings;
        this.totalRevenue = totalRevenue != null ? totalRevenue : BigDecimal.ZERO;
        this.formattedTotalRevenue = formatVndPrice(this.totalRevenue);
        this.tourRevenue = tourRevenue != null ? tourRevenue : BigDecimal.ZERO;
        this.formattedTourRevenue = formatVndPrice(this.tourRevenue);
        this.hotelRevenue = hotelRevenue != null ? hotelRevenue : BigDecimal.ZERO;
        this.formattedHotelRevenue = formatVndPrice(this.hotelRevenue);
        this.pendingCount = pendingCount;
        this.confirmedCount = confirmedCount;
        this.paidCount = paidCount;
        this.completedCount = completedCount;
        this.cancelledCount = cancelledCount;
        this.totalPayments = totalPayments;
        this.reconciledPayments = reconciledPayments;
        this.reconciliationRate = reconciliationRate;
    }

    private static String formatVndPrice(BigDecimal amount) {
        if (amount == null) {
            return "0 đ";
        }
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        return nf.format(amount) + " đ";
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
        this.formattedTotalRevenue = formatVndPrice(totalRevenue);
    }

    public String getFormattedTotalRevenue() {
        return formattedTotalRevenue;
    }

    public BigDecimal getTourRevenue() {
        return tourRevenue;
    }

    public void setTourRevenue(BigDecimal tourRevenue) {
        this.tourRevenue = tourRevenue;
        this.formattedTourRevenue = formatVndPrice(tourRevenue);
    }

    public String getFormattedTourRevenue() {
        return formattedTourRevenue;
    }

    public BigDecimal getHotelRevenue() {
        return hotelRevenue;
    }

    public void setHotelRevenue(BigDecimal hotelRevenue) {
        this.hotelRevenue = hotelRevenue;
        this.formattedHotelRevenue = formatVndPrice(hotelRevenue);
    }

    public String getFormattedHotelRevenue() {
        return formattedHotelRevenue;
    }

    public long getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(long pendingCount) {
        this.pendingCount = pendingCount;
    }

    public long getConfirmedCount() {
        return confirmedCount;
    }

    public void setConfirmedCount(long confirmedCount) {
        this.confirmedCount = confirmedCount;
    }

    public long getPaidCount() {
        return paidCount;
    }

    public void setPaidCount(long paidCount) {
        this.paidCount = paidCount;
    }

    public long getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(long completedCount) {
        this.completedCount = completedCount;
    }

    public long getCancelledCount() {
        return cancelledCount;
    }

    public void setCancelledCount(long cancelledCount) {
        this.cancelledCount = cancelledCount;
    }

    public long getTotalPayments() {
        return totalPayments;
    }

    public void setTotalPayments(long totalPayments) {
        this.totalPayments = totalPayments;
    }

    public long getReconciledPayments() {
        return reconciledPayments;
    }

    public void setReconciledPayments(long reconciledPayments) {
        this.reconciledPayments = reconciledPayments;
    }

    public double getReconciliationRate() {
        return reconciliationRate;
    }

    public void setReconciliationRate(double reconciliationRate) {
        this.reconciliationRate = reconciliationRate;
    }
}
