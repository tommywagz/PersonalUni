package unsw.blackout;

import unsw.utils.Angle;

public class StandardSatellite extends NormalSatellite {
    public String type = "StandardSatellite";
    public double linSpeed = 2500;
    public String supportedDevices[] = {
            "HandheldDevice", "LaptopDevice"
    };
    public double range = 150000;
    public int fileMemMax = 3;
    public int byteMemMax = 80;
    public int bandwidthIn = 1;
    public int bandwidthOut = 1;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getRange() {
        return range;
    }

    public void setRange(double range) {
        this.range = range;
    }

    public int getBandwidthIn() {
        return bandwidthIn;
    }

    public int getBandwidthOut() {
        return bandwidthOut;
    }

    public double getLinSpeed() {
        return linSpeed;
    }

    public StandardSatellite(String id, double height, Angle Position) {
        this.Id = id;
        setHeight(height);
        setPosition(Position);
        setLinSpeed(linSpeed);
    }

}
