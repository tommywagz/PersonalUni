package unsw.blackout;

import unsw.utils.Angle;

public class DesktopDevice extends Device {
    public String type = "DesktopDevice";
    public double range = 200000;

    public String getType() {
        return type;
    }

    public double getRange() {
        return range;
    }

    public DesktopDevice(String id, Angle position) {
        this.Id = id;
        this.position = position;
    }

}
