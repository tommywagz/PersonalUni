package unsw.blackout;

import unsw.utils.Angle;
// import static unsw.utils.MathsHelper.RADIUS_OF_JUPITER;
import unsw.utils.MathsHelper;

public abstract class Entity {
    public String type;
    public String Id;
    public double height;
    public Angle position;
    public double range;

    public String getType() {
        return type;
    }

    public String getId() {
        return Id;
    }

    public double getHeight() {
        return height;
    }

    public Angle getPosition() {
        return position;
    }

    public double getRange() {
        return range;
    }

    public void setRange(double range) {
        this.range = range;
    }

    /**
     * Tells if this entity is visible to a given entity
     * @param sat
     * @return boolean satelliteIsVisible
     */
    public boolean entIsVis(Entity ent) {
        double dist;
        boolean vis;
        // this is a device looking for satellites
        if (this instanceof Device) {
            dist = MathsHelper.getDistance(ent.getHeight(), ent.getPosition(), getPosition());
            vis = MathsHelper.isVisible(ent.getHeight(), ent.getPosition(), getPosition());
        }

        // this is a satellite looking for other sats
        else {
            dist = MathsHelper.getDistance(getHeight(), getPosition(), ent.getHeight(), ent.getPosition());
            vis = MathsHelper.isVisible(ent.getHeight(), ent.getPosition(), getHeight(), getPosition());
        }

        // System.out.println(dist + " far away with range " + getRange() + " and " + vis + " visibility");

        if (vis && dist <= getRange()) {
            return true;
        }

        return false;
    }
}

