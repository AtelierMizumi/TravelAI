package com.travelai.core.dto.response;

import java.util.ArrayList;
import java.util.List;

public class PartnerStatsResponse {

    private long totalTours;
    private long activeTours;
    private long inactiveTours;
    private long suspendedTours;
    private long totalHotels;
    private long activeHotels;
    private long inactiveHotels;
    private long suspendedHotels;
    private long totalServices;
    private long totalLocationsWithServices;
    private long totalActiveTourSlots;
    private long totalActiveHotelRooms;
    private List<ProvinceServiceCount> servicesByProvince = new ArrayList<>();

    public PartnerStatsResponse() {
    }

    public PartnerStatsResponse(long totalTours, long activeTours, long inactiveTours, long suspendedTours,
                                long totalHotels, long activeHotels, long inactiveHotels, long suspendedHotels,
                                long totalServices, long totalLocationsWithServices,
                                long totalActiveTourSlots, long totalActiveHotelRooms,
                                List<ProvinceServiceCount> servicesByProvince) {
        this.totalTours = totalTours;
        this.activeTours = activeTours;
        this.inactiveTours = inactiveTours;
        this.suspendedTours = suspendedTours;
        this.totalHotels = totalHotels;
        this.activeHotels = activeHotels;
        this.inactiveHotels = inactiveHotels;
        this.suspendedHotels = suspendedHotels;
        this.totalServices = totalServices;
        this.totalLocationsWithServices = totalLocationsWithServices;
        this.totalActiveTourSlots = totalActiveTourSlots;
        this.totalActiveHotelRooms = totalActiveHotelRooms;
        if (servicesByProvince != null) {
            this.servicesByProvince = servicesByProvince;
        }
    }

    public static class ProvinceServiceCount {
        private String province;
        private long tourCount;
        private long hotelCount;
        private long totalCount;

        public ProvinceServiceCount() {
        }

        public ProvinceServiceCount(String province, long tourCount, long hotelCount) {
            this.province = province;
            this.tourCount = tourCount;
            this.hotelCount = hotelCount;
            this.totalCount = tourCount + hotelCount;
        }

        public String getProvince() {
            return province;
        }

        public void setProvince(String province) {
            this.province = province;
        }

        public long getTourCount() {
            return tourCount;
        }

        public void setTourCount(long tourCount) {
            this.tourCount = tourCount;
        }

        public long getHotelCount() {
            return hotelCount;
        }

        public void setHotelCount(long hotelCount) {
            this.hotelCount = hotelCount;
        }

        public long getTotalCount() {
            return totalCount;
        }

        public void setTotalCount(long totalCount) {
            this.totalCount = totalCount;
        }
    }

    public long getTotalTours() {
        return totalTours;
    }

    public void setTotalTours(long totalTours) {
        this.totalTours = totalTours;
    }

    public long getActiveTours() {
        return activeTours;
    }

    public void setActiveTours(long activeTours) {
        this.activeTours = activeTours;
    }

    public long getInactiveTours() {
        return inactiveTours;
    }

    public void setInactiveTours(long inactiveTours) {
        this.inactiveTours = inactiveTours;
    }

    public long getSuspendedTours() {
        return suspendedTours;
    }

    public void setSuspendedTours(long suspendedTours) {
        this.suspendedTours = suspendedTours;
    }

    public long getTotalHotels() {
        return totalHotels;
    }

    public void setTotalHotels(long totalHotels) {
        this.totalHotels = totalHotels;
    }

    public long getActiveHotels() {
        return activeHotels;
    }

    public void setActiveHotels(long activeHotels) {
        this.activeHotels = activeHotels;
    }

    public long getInactiveHotels() {
        return inactiveHotels;
    }

    public void setInactiveHotels(long inactiveHotels) {
        this.inactiveHotels = inactiveHotels;
    }

    public long getSuspendedHotels() {
        return suspendedHotels;
    }

    public void setSuspendedHotels(long suspendedHotels) {
        this.suspendedHotels = suspendedHotels;
    }

    public long getTotalServices() {
        return totalServices;
    }

    public void setTotalServices(long totalServices) {
        this.totalServices = totalServices;
    }

    public long getTotalLocationsWithServices() {
        return totalLocationsWithServices;
    }

    public void setTotalLocationsWithServices(long totalLocationsWithServices) {
        this.totalLocationsWithServices = totalLocationsWithServices;
    }

    public long getTotalActiveTourSlots() {
        return totalActiveTourSlots;
    }

    public void setTotalActiveTourSlots(long totalActiveTourSlots) {
        this.totalActiveTourSlots = totalActiveTourSlots;
    }

    public long getTotalActiveHotelRooms() {
        return totalActiveHotelRooms;
    }

    public void setTotalActiveHotelRooms(long totalActiveHotelRooms) {
        this.totalActiveHotelRooms = totalActiveHotelRooms;
    }

    public List<ProvinceServiceCount> getServicesByProvince() {
        return servicesByProvince;
    }

    public void setServicesByProvince(List<ProvinceServiceCount> servicesByProvince) {
        this.servicesByProvince = servicesByProvince;
    }
}
