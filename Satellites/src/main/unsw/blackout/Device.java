package unsw.blackout;

import static unsw.utils.MathsHelper.RADIUS_OF_JUPITER;
import unsw.response.models.FileInfoResponse;

public abstract class Device extends ExchangingEntity {
    public double height = RADIUS_OF_JUPITER;
    public int bandwidthIn = Integer.MAX_VALUE;
    public int bandwidthOut = Integer.MAX_VALUE;

    public void setHeight(int height) {
        this.height = height;
    }

    public double getHeight() {
        return height;
    }

    public int getBandwidthIn() {
        return bandwidthIn;
    }

    public void setBandwidthIn(int bandwidthIn) {
        this.bandwidthIn = bandwidthIn;
    }

    public int getBandwidthOut() {
        return bandwidthOut;
    }

    public void setBandwidthOut(int bandwidthOut) {
        this.bandwidthOut = bandwidthOut;
    }

    /**
     * Gets the File from a given device named fileName
     * Assumes both id and filename are valid
     * @param devId
     * @param fileName
     * @return
     */
    public FileInfoResponse getFileInfoFromDevice(String fileName) {
        return getAllFiles().get(fileName);
    }

}
