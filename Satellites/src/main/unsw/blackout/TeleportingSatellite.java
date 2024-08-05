package unsw.blackout;

import java.util.Map;
import java.util.List;
import unsw.utils.Angle;
import unsw.response.models.FileInfoResponse;

public class TeleportingSatellite extends NormalSatellite {
    public String type = "TeleportingSatellite";
    public double linSpeed = 1000;
    public String supportedDevices[] = {
            "HandheldDevice", "LaptopDevice", "DesktopDevice"
    };
    public double range = 200000;
    public int byteMemMax = 200;
    public int bandwidthIn = 15;
    public int bandwidthOut = 10;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setRange(double range) {
        this.range = range;
    }

    public double getRange() {
        return range;
    }

    public TeleportingSatellite(String id, double height, Angle position) {
        this.Id = id;
        setHeight(height);
        setPosition(position);
    }

    @Override
    public void move() {
        super.move();
        teleport();
    }

    /**
     * Upon hitting 180* teleports the satellite back to 0*
     * @return
     */
    public void teleport() {
        Angle currentPos = getPosition();
        Angle angleSpeed = Angle.fromRadians(getAngularVelocity());
        Angle telePoint = Angle.fromDegrees(180);

        // if linSpeed > 0 and angSpeed + currentPos > 180
        // or if linSpeec < 0 and angSpeed + currentPos < 180
        if ((getLinSpeed() > 0 && angleSpeed.add(currentPos).compareTo(telePoint) == 1)
                || (getLinSpeed() < 0 && angleSpeed.add(currentPos).compareTo(telePoint) == -1)) {
            double newPos = currentPos.toDegrees();
            newPos *= -1;
            setPosition(Angle.fromDegrees(newPos));
            setLinSpeed(getLinSpeed() * -1);
        }
    }

    /**
    * instantly sends a given file to a given receiver
    * Assumes the given file has already been de-t'd
    * @param file
    * @param receiver
    */
    public void instantFileTransferTo(File file, ExchangingEntity receiver) {
        // given file is already de-t'd so just send to receiver and remove from this

        // add to receiver's current
        List<File> newRecCurrent = receiver.getCurrentFiles();
        newRecCurrent.add(file);
        receiver.setCurrentFiles(newRecCurrent);

        // find corresponding file in receiver's loading and delete it
        File replacee = null;
        List<File> newLoading = receiver.getLoadingFiles();

        for (File replace : newLoading) {
            if (replace.getFileName().equals(file.getFileName())) {
                replacee = replace;
            }
        }

        newLoading.remove(replacee);
        newLoading.add(file);
        receiver.setLoadingFiles(newLoading);

        // remove corresponding send file from this sending and current
        replacee = null;
        List<File> newSending = getLoadingFiles();

        for (File replace : newSending) {
            if (replace.getFileName().equals(file.getFileName())) {
                replacee = replace;
            }
        }

        newSending.remove(replacee);
        setSendingFiles(newSending);

        List<File> newCurrent = getCurrentFiles();
        newCurrent.remove(file);
        setCurrentFiles(newCurrent);
    }

    /**
     * Instantly receiver a given file from a given sender
     * Assumes the given file has already been de-t'd
     * @param file
     * @param sender
     */
    public void instantFileTransferFrom(File file, ExchangingEntity sender) {
        // given file is already de-t'd so just send to receiver and remove from this

        // add to current
        List<File> newRecCurrent = getCurrentFiles();
        newRecCurrent.add(file);
        setCurrentFiles(newRecCurrent);

        // find corresponding file in loading and delete it
        List<File> newLoading = getLoadingFiles();
        Map<String, FileInfoResponse> oldAllFiles = getAllFiles();
        File replacee = getCorrespondingFile(file, newLoading);
        FileInfoResponse oldInfo = getCorrespondingInfo(file, oldAllFiles);
        newLoading.remove(replacee);
        newLoading.add(file);
        setLoadingFiles(newLoading);

        // remove corresponding send file from sender's sending and current
        List<File> newSending = sender.getLoadingFiles();
        Map<String, FileInfoResponse> newAllFiles = sender.getAllFiles();
        replacee = getCorrespondingFile(file, newSending);
        oldInfo = getCorrespondingInfo(file, newAllFiles);
        newSending.remove(replacee);
        sender.setSendingFiles(newSending);

        List<File> newCurrent = sender.getCurrentFiles();

        replacee = getCorrespondingFile(file, newCurrent);
        newCurrent.remove(file);
        sender.setCurrentFiles(newCurrent);
    }

}

