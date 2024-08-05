package unsw.blackout;

import java.util.Arrays;

import unsw.blackout.FileTransferException.VirtualFileNoBandwidthException;
import unsw.blackout.FileTransferException.VirtualFileNoStorageSpaceException;

import unsw.response.models.FileInfoResponse;
import unsw.utils.Angle;
import unsw.utils.MathsHelper;

public abstract class NormalSatellite extends ExchangingEntity implements Satellite {
    public double linSpeed;
    public String supportedDevices[];
    public int fileMemMax;
    public int byteMemMax;

    public double getLinSpeed() {
        return linSpeed;
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

    public int getFileMemMax() {
        return fileMemMax;
    }

    public int getByteMemMax() {
        return byteMemMax;
    }

    public String[] getSupportedDevices() {
        return supportedDevices;
    }

    public void setFileMemMax(int fileMemMax) {
        this.fileMemMax = fileMemMax;
    }

    public void setByteMemMax(int byteMemMax) {
        this.byteMemMax = byteMemMax;
    }

    public void setSupportedDevices(String[] supportedDevices) {
        this.supportedDevices = supportedDevices;
    }

    public void setBandwidthIn(int bandwidthIn) {
        this.bandwidthIn = bandwidthIn;
    }

    public void setBandwidthOut(int bandwidthOut) {
        this.bandwidthOut = bandwidthOut;
    }

    /**
     * gets the current angular velocity of the entity
     * @param height
     * @param linSpeed
     * @return double angular velocity
     */
    public double getAngularVelocity() {
        System.out.println(this.linSpeed + " - linSpeed, height - " + this.height);
        return -1 * (this.linSpeed) / this.height;
    }

    /**
     * Changes the position angle of this satellite 
     * according to it's angular velocity and height.
     * Moves like a standard satellite
     */
    public void move() {
        System.out.println("Old pos: " + getPosition());
        double angVel = getAngularVelocity();
        System.out.println(getAngularVelocity() + " is the ang velocity");
        Angle newPos = Angle.fromRadians(angVel);

        newPos = newPos.add(getPosition());
        setPosition(newPos);

        System.out.println("New pos is: " + getPosition());
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
     * Adds the next byte from the given file from the given sender to
     * the corresponding loading file 
     * @param subject
     * @param sender
     * @throws VirtualFileNoBandwidthException
     * @throws VirtualFileNStorageSpaceException
     */
    public void getNextFileFromSat(File subject, NormalSatellite sender)
            throws VirtualFileNoBandwidthException, VirtualFileNoStorageSpaceException {

        // fileMax or byteMax is reached, throw VirtualFileNoStorageSpaceException 
        // THIS INCLUDES POTENTIAL BYTES that havn't been downloaded yet
        double totalLoadingSize = getLoadingFiles().stream().mapToInt(File::getLength).sum();
        if (getAllFiles().size() >= getFileMemMax()) {
            throw new FileTransferException.VirtualFileNoStorageSpaceException("Max Files Reached");
        }
        if (totalLoadingSize + subject.getInfo().getFileSize() > getByteMemMax()) {
            throw new FileTransferException.VirtualFileNoStorageSpaceException("Max Storage Reached");
        }

        recieveNewFile(subject, sender);

        // from 1 - maxSendRate pop a character from the sendingFile to the recieving one

    }

    /**
     * Adds the next byte from each loading file to the file from the 
     * corresponding file from the sender
     * @param subject
     * @param sender
     * @param maxSendRate
     */
    public void getNextFileFromDev(FileInfoResponse subject, Device sender) {
        // make sure the reciever is supported to the sender
        if (!Arrays.asList(getSupportedDevices()).contains(sender.getType())) {
            System.out.println("Unsupported Device");
            return;
        }

    }

}
