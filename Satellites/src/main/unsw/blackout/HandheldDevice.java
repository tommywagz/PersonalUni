package unsw.blackout;

import unsw.utils.Angle;

public class HandheldDevice extends Device {
    public String type = "HandheldDevice";
    public double range = 50000;

    public String getType() {
        return type;
    }

    public double getRange() {
        return range;
    }

    public HandheldDevice(String id, Angle position) {
        this.Id = id;
        this.position = position;
    }
}
