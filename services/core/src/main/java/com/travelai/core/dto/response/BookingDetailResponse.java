package com.travelai.core.dto.response;

import com.travelai.core.model.entity.BookingDetail;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

public class BookingDetailResponse {

    private Long id;
    private String itemType;
    private Long itemId;
    private String itemName;
    private BigDecimal unitPrice;
    private String formattedUnitPrice;
    private Integer quantity;
    private Integer numberOfNights;
    private BigDecimal subtotal;
    private String formattedSubtotal;

    public BookingDetailResponse() {
    }

    public BookingDetailResponse(Long id, String itemType, Long itemId, String itemName,
                                 BigDecimal unitPrice, String formattedUnitPrice, Integer quantity,
                                 Integer numberOfNights, BigDecimal subtotal, String formattedSubtotal) {
        this.id = id;
        this.itemType = itemType;
        this.itemId = itemId;
        this.itemName = itemName;
        this.unitPrice = unitPrice;
        this.formattedUnitPrice = formattedUnitPrice;
        this.quantity = quantity;
        this.numberOfNights = numberOfNights;
        this.subtotal = subtotal;
        this.formattedSubtotal = formattedSubtotal;
    }

    public static BookingDetailResponse fromEntity(BookingDetail detail) {
        if (detail == null) {
            return null;
        }

        Long itemId = null;
        if ("TOUR".equalsIgnoreCase(detail.getItemType()) && detail.getTour() != null) {
            itemId = detail.getTour().getId();
        } else if ("HOTEL".equalsIgnoreCase(detail.getItemType()) && detail.getHotel() != null) {
            itemId = detail.getHotel().getId();
        }

        return new BookingDetailResponse(
                detail.getId(),
                detail.getItemType(),
                itemId,
                detail.getItemName(),
                detail.getUnitPrice(),
                formatVndPrice(detail.getUnitPrice()),
                detail.getQuantity(),
                detail.getNumberOfNights(),
                detail.getSubtotal(),
                formatVndPrice(detail.getSubtotal())
        );
    }

    private static String formatVndPrice(BigDecimal amount) {
        if (amount == null) {
            return "0 đ";
        }
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        return nf.format(amount) + " đ";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItemType() {
        return itemType;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public String getFormattedUnitPrice() {
        return formattedUnitPrice;
    }

    public void setFormattedUnitPrice(String formattedUnitPrice) {
        this.formattedUnitPrice = formattedUnitPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getNumberOfNights() {
        return numberOfNights;
    }

    public void setNumberOfNights(Integer numberOfNights) {
        this.numberOfNights = numberOfNights;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public String getFormattedSubtotal() {
        return formattedSubtotal;
    }

    public void setFormattedSubtotal(String formattedSubtotal) {
        this.formattedSubtotal = formattedSubtotal;
    }
}
