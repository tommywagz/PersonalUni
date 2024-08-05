package unsw.blackout;

import unsw.utils.Angle;

public class LaptopDevice extends Device {
    public String type = "LaptopDevice";
    public double range = 100000;

    public String getType() {
        return type;
    }

    public double getRange() {
        return range;
    }

    public LaptopDevice(String id, Angle position) {
        this.Id = id;
        this.position = position;
    }

}
