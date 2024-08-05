package unsw.blackout;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import unsw.response.models.FileInfoResponse;

public class ExchangingEntity extends Entity {
    public int bandwidthIn;
    public int bandwidthOut;
    public List<String> visibles = new ArrayList<String>();
    public List<File> currentFiles = new ArrayList<File>();
    private List<File> loadingFiles = new ArrayList<File>();
    private List<File> sendingFiles = new ArrayList<File>();
    Map<String, FileInfoResponse> allFiles = new HashMap<>();

    public List<String> getVisibles() {
        return visibles;
    }

    public void setVisibles(List<String> visibles) {
        this.visibles = visibles;
    }

    public int getBandwidthIn() {
        return bandwidthIn;
    }

    public int getBandwidthOut() {
        return bandwidthOut;
    }

    public Map<String, FileInfoResponse> getAllFiles() {
        return allFiles;
    }

    public void setAllFiles(Map<String, FileInfoResponse> expectedFiles) {
        this.allFiles = expectedFiles;
    }

    public List<File> getLoadingFiles() {
        return loadingFiles;
    }

    public void setLoadingFiles(List<File> loadingFiles) {
        this.loadingFiles = loadingFiles;
    }

    public List<File> getSendingFiles() {
        return sendingFiles;
    }

    public void setSendingFiles(List<File> sendingFiles) {
        this.sendingFiles = sendingFiles;
    }

    public List<File> getCurrentFiles() {
        return currentFiles;
    }

    public void setCurrentFiles(List<File> currentFiles) {
        this.currentFiles = currentFiles;
    }

    /**
     * Moves the appropriate amont of characters (sendRate) to the destination file
     * from the sender file of the same name. Given a File with the same name
     * Assumes all valid inputs
     * @param file
     * @param sender
     */
    public void tick(File file, ExchangingEntity sender) {
        // get the send rate
        double sendRate = Math.min(getBandwidthIn() / (getLoadingFiles().size() + 1),
                sender.getBandwidthOut() / (sender.getSendingFiles().size() + 1));

        // get the file from the sending and recieving list
        List<File> sendingList = sender.getSendingFiles();
        List<File> recievingList = getLoadingFiles();

        File sendFile = getCorrespondingFile(file, sendingList);
        File getFile = getCorrespondingFile(file, recievingList);

        FileInfoResponse sendInfo = sendFile.getInfo();
        FileInfoResponse getInfo = getFile.getInfo();
        System.out.println(
                sendInfo.getFilename() + ", " + sendFile.getBody() + " is " + sendInfo.getFileSize() + " long");

        exchangeBytes(sendRate, sendFile, getFile, recievingList, sendingList, sender);

    }

    /**
     * Exchangies the given number of characters 
     * between the given send and get files
     * found in the given send and receieve lists
     * @param sendRate
     * @param sendFile
     * @param getFile
     * @param recievingList
     * @param sendingList
     */
    public void exchangeBytes(double sendRate, File sendFile, File getFile, List<File> recievingList,
            List<File> sendingList, ExchangingEntity sender) {
        // EXCHANGE sendRate number of BYTES
        for (int i = 0; i < sendRate; i++) {
            System.out.println(sendFile.getBody() + " is " + sendFile.getLength() + " long");
            if (sendFile.getBody().length() > 0) {
                String sendingBody = sendFile.getBody();
                char sendChar = sendingBody.charAt(0);
                sendingBody = sendingBody.substring(1);

                // eliminate the first character
                sendFile.setBody(sendingBody);
                // add eliminated character to getFile
                getFile.setBody(getFile.getBody().concat(String.valueOf(sendChar)));

            } else {
                // remove corresponding from map and current (if satellite) 

                if (this instanceof NormalSatellite) {
                    List<File> current = getCurrentFiles();
                    current.add(getFile);
                    setCurrentFiles(current);

                    Map<String, FileInfoResponse> newMap = getAllFiles();
                    newMap.put(getFile.getFileName(), getFile.getInfo());
                    setAllFiles(newMap);
                }

                // move from the recievers loading list into this's current list and map
                recievingList.remove(getFile);
                setLoadingFiles(recievingList);

                List<File> newCurr = getCurrentFiles();
                newCurr.add(getFile);
                setCurrentFiles(newCurr);

                Map<String, FileInfoResponse> newMap = getAllFiles();
                newMap.put(getFile.getFileName(), getFile.getInfo());

                // remove corresponding from the sendingList 
                sendingList.remove(sendFile);
                sender.setSendingFiles(sendingList);
                break;
            }
        }
    }

    /**
     * Reverts a file transfer from either a device (if either satellite)
     * or a satellite (if standard satellite) where the given file is the 
     * version of the file that is being sent back to the sender
     * @param file
     * @param sender
     */
    public void revertTransferFrom(File file, ExchangingEntity sender) {
        // Remove the corresponding file from this entity (map and loading)
        List<File> newLoading = getLoadingFiles();
        File base = getCorrespondingFile(file, newLoading);
        newLoading.remove(base);
        setLoadingFiles(newLoading);

        Map<String, FileInfoResponse> newMap = getAllFiles();
        newMap.remove(file.getFileName());
        setAllFiles(newMap);

        // put the given file in the sender's current list and remove from sending List
        List<File> newCurrent = sender.getCurrentFiles();
        newCurrent.add(file);
        sender.setCurrentFiles(newCurrent);

        List<File> newSending = sender.getSendingFiles();
        newSending.remove(file);
        sender.setSendingFiles(newSending);
    }

    /**
     * Given a new file, add it to the loading List if not already
     * @param newFile
     * @param sender
     */
    public void recieveNewFile(File newFile, ExchangingEntity sender) {
        // add the file to the sender's sendingFiles list
        List<File> newSending = sender.getSendingFiles();
        newSending.add(newFile);
        sender.setSendingFiles(newSending);

        // make file to be filled with data and add it to this entity's loading
        File shiftFile = new File("", newFile.getFileName(), false);
        shiftFile.setComplete(false);
        shiftFile.setLength(0);

        List<File> newLoading = getLoadingFiles();
        newLoading.add(shiftFile);
        setLoadingFiles(newLoading);

        // add new file to this's allFiles map 
        Map<String, FileInfoResponse> newAllFile = getAllFiles();
        FileInfoResponse shiftInfo = new FileInfoResponse(newFile.getFileName(), "", newFile.getBody().length(), false);
        newAllFile.put(shiftFile.getFileName(), shiftInfo);

        // remove form the sender's currentFiles list
        List<File> newCurrent = sender.getCurrentFiles();
        newCurrent.remove(newFile);
        sender.setCurrentFiles(newCurrent);

        System.out.println(shiftInfo.getFilename() + " with body: (" + shiftInfo.getData() + ") [size: "
                + shiftInfo.getFileSize() + "]");
    }

    /**
     * Helper function that gets the corresponding 
     * file from the given in the given list
     * @param newFile
     * @param fileList
     * @return
     */
    public File getCorrespondingFile(File newFile, List<File> fileList) {
        File returnFile = null;
        for (File temp : fileList) {
            if (temp.getFileName().equals(newFile.getFileName())) {
                return temp;
            }
        }

        return returnFile;
    }

    /**
     * Gets the FileInfoResponse from this entity's map 
     * corresponding to the newFile
     * @param newFile
     * @param fileMap
     * @return
     */
    public FileInfoResponse getCorrespondingInfo(File newFile, Map<String, FileInfoResponse> fileMap) {
        for (FileInfoResponse temp : fileMap.values()) {
            if (temp.getFilename().equals(newFile.getFileName())) {
                return temp;
            }
        }

        return null;
    }
}

