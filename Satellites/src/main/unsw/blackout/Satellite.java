package unsw.blackout;

import unsw.utils.Angle;

public interface Satellite {
    public double getLinSpeed();
    
    public void setLinSpeed(double linSpeed);

    public void setHeight(double height);

    public void setPosition(Angle position);

    /**
     * gets the current angular velocity of the entity
     * @param height
     * @param linSpeed
     * @return double angular velocity
     */
    public double getAngularVelocity();
    
    /**
     * Changes the position angle of this satellite 
     * according to it's angular velocity and height.
     * Moves like a standard satellite
     */
    public void move();

    /**
     * Checks if the given device is visible from this satellite
     * @param dev
     * @return boolean
     */
    public boolean devIsVis(Device dev);

}

