package unsw.blackout;

import unsw.utils.Angle;
import unsw.utils.MathsHelper;

public class RelaySatellite extends Entity implements Satellite {
    public String type = "RelaySatellite";
    public double linSpeed = -1500;
    public double range = 300000;
    public String supportedDevices[] = {"HandheldDevice", "LaptopDevice", "DesktopDevice"};

    public RelaySatellite(String id, double height, Angle position) {
        this.Id = id;
        setHeight(height);
        setPosition(position);
    }

    public double getLinSpeed() {
        return this.linSpeed;
    }
    
    public void setLinSpeed(double linSpeed) {
        this.linSpeed = linSpeed;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public void setPosition(Angle position) {
        this.position = position;
    }

    public double getRange() {
        return range;
    }

    public String[] getSupportedDevices() {
        return supportedDevices;
    }

    public String getType() {
        return type;
    }


     /**
     * gets the current angular velocity of the entity
     * @param height
     * @param linSpeed
     * @return double angular velocity
     */
    public double getAngularVelocity() {
        return this.linSpeed / (this.height);
    }
    

    /**
     * Changes the position angle of this satellite 
     * according to it's angular velocity and height.
     * Moves like a standard satellite
     */
    public void move() {
        double angVel = getAngularVelocity();
        Angle newPos = Angle.fromRadians(angVel);

        newPos = newPos.add(getPosition());
        this.setPosition(newPos);

        correct();
    }


    /**
     * Checks if the given device is visible from this satellite
     * @param dev
     * @return boolean
     */
    public boolean devIsVis(Device dev) {
        double dist;
        boolean vis;
        dist = MathsHelper.getDistance(getHeight(), getPosition(), dev.getPosition());
        vis = MathsHelper.isVisible(getHeight(), getPosition(), dev.getPosition());
             
        if (dist <= getRange() && vis) {
            return true;
        }

        return false;
    }


    /**
     * Sets the linear speed of the relay sat to the opposite direction
     * with the same magnitude of speed
     */
    public void correct() {
        Angle halfway = Angle.fromDegrees(345);
        Angle upper = Angle.fromDegrees(140);
        Angle lower = Angle.fromDegrees(190);
        Angle current = getPosition();

        if ((getLinSpeed() < 0 && (current.compareTo(halfway) == 1 || 
        current.compareTo(upper) == -1)) || (getLinSpeed() > 0 &&
        (current.compareTo(halfway) == -1 || current.compareTo(lower) == 1))) {
            double newLinSpeed = getLinSpeed();
            newLinSpeed *= -1;
            setLinSpeed(newLinSpeed);
        }
    }


}

