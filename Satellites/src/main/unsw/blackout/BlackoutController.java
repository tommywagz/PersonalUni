package unsw.blackout;

import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import unsw.blackout.FileTransferException.VirtualFileNoBandwidthException;
import unsw.blackout.FileTransferException.VirtualFileNotFoundException;
import unsw.blackout.FileTransferException.VirtualFileAlreadyExistsException;
import unsw.blackout.FileTransferException.VirtualFileNoStorageSpaceException;
import unsw.response.models.EntityInfoResponse;
import unsw.response.models.FileInfoResponse;
import unsw.utils.Angle;

/**
 * The controller for the Blackout system.
 *
 * WARNING: Do not move this file or modify any of the existing method
 * signatures
 */
public class BlackoutController {
    private List<Device> devices = new ArrayList<Device>();
    private List<NormalSatellite> satellites = new ArrayList<NormalSatellite>();
    private List<RelaySatellite> relays = new ArrayList<RelaySatellite>();
    private List<ExchangingEntity> entities = new ArrayList<ExchangingEntity>();
    private List<Entity> allEntities = new ArrayList<Entity>();

    public void createDevice(String deviceId, String type, Angle position) {
        switch (type) {
        case "HandheldDevice":
            HandheldDevice hand = new HandheldDevice(deviceId, position);
            devices.add(hand);
            entities.add(hand);
            allEntities.add(hand);
            break;
        case "LaptopDevice":
            LaptopDevice lap = new LaptopDevice(deviceId, position);
            devices.add(lap);
            entities.add(lap);
            allEntities.add(lap);

            break;
        case "DesktopDevice":
            DesktopDevice desk = new DesktopDevice(deviceId, position);
            devices.add(desk);
            entities.add(desk);
            allEntities.add(desk);
            break;
        default:
            break;
        }
    }

    public void removeDevice(String deviceId) {
        // scan through the ArrayList of devices and delete appropriate device
        for (Device dev : devices) {
            if (dev.getId().equals(deviceId)) {
                System.out.println(devices);
                devices.remove(dev);
                entities.remove(dev);
                System.out.println(devices);
                break;
            }
        }
    }

    public void createSatellite(String satelliteId, String type, double height, Angle position) {
        switch (type) {
        case "StandardSatellite":
            StandardSatellite stand = new StandardSatellite(satelliteId, height, position);
            satellites.add(stand);
            entities.add(stand);
            allEntities.add(stand);
            break;
        case "TeleportingSatellite":
            TeleportingSatellite tele = new TeleportingSatellite(satelliteId, height, position);
            satellites.add(tele);
            entities.add(tele);
            allEntities.add(tele);
            break;
        case "RelaySatellite":
            RelaySatellite relay = new RelaySatellite(satelliteId, height, position);
            relays.add(relay);
            allEntities.add(relay);
            break;
        default:
            break;
        }
    }

    public void removeSatellite(String satelliteId) {
        for (NormalSatellite sat : satellites) {
            if (sat.getId().equals(satelliteId)) {
                System.out.println(sat);
                satellites.remove(sat);
                entities.remove(sat);
                System.out.println(sat);
                break;
            }
        }
    }

    public List<String> listDeviceIds() {
        List<String> devIds = new ArrayList<String>();
        for (Device dev : devices) {
            devIds.add(dev.getId());
        }
        return devIds;
    }

    public List<String> listSatelliteIds() {
        List<String> satIds = new ArrayList<String>();
        for (NormalSatellite sat : satellites) {
            satIds.add(sat.getId());
        }
        for (RelaySatellite rel : relays) {
            satIds.add(rel.getId());
        }
        return satIds;
    }

    public void addFileToDevice(String deviceId, String filename, String content) {
        File newFile = new File(content, filename, true);
        for (Device dev : devices) {
            if (dev.getId().equals(deviceId)) {
                List<File> current = dev.getCurrentFiles();
                current.add(newFile);
                dev.setCurrentFiles(current);

                Map<String, FileInfoResponse> devMap = dev.getAllFiles();
                devMap.put(filename, newFile.getInfo());
                dev.setAllFiles(devMap);
                break;
            }
        }

    }

    public EntityInfoResponse getInfo(String id) {
        Angle pos;
        double height;
        String type;
        Map<String, FileInfoResponse> files;

        EntityInfoResponse response = null;

        for (ExchangingEntity ent : entities) {
            if (ent.getId().equals(id)) {
                pos = ent.getPosition();
                height = ent.getHeight();
                type = ent.getType();
                files = ent.getAllFiles();
                response = new EntityInfoResponse(id, pos, height, type, files);
            }
        }

        return response;
    }

    public void simulate() {
        // for each exEnt get the list of visibles before movement
        for (ExchangingEntity ent : entities) {
            List<String> initialVisibles = communicableEntitiesInRange(ent.getId());
            ent.setVisibles(initialVisibles);
        }

        // move all of the satellites appropriately
        for (NormalSatellite sat : satellites) {
            sat.move();
        }
        for (RelaySatellite rel : relays) {
            rel.move();
        }

        // get the list of visibles after movement 
        for (ExchangingEntity ent : entities) {
            List<String> postVisibles = communicableEntitiesInRange(ent.getId());
            List<String> initialVisibles = ent.getVisibles();

            // tick the intersection of exEnt

            // convert from stringIds to entities
            List<String> intersection = initialVisibles;
            intersection.retainAll(postVisibles);

            List<ExchangingEntity> intersecting = new ArrayList<ExchangingEntity>();
            for (String entName : intersection) {
                intersecting.add(getExEntFromId(entName));
            }

            // tick the interesecting exEnts
            for (ExchangingEntity inter : intersecting) {
                inter.tick(getFileFromSenderToReciever(ent, inter), ent);
            }

            // revert the difference

            // find the difference: post + initial - intersection
            List<String> difference = initialVisibles;
            difference.addAll(postVisibles);
            difference.removeAll(intersection);

            // get the list of entities from the list of strings
            List<ExchangingEntity> EntityDifference = new ArrayList<ExchangingEntity>();
            for (String entName : difference) {
                EntityDifference.add(getExEntFromId(entName));
            }

            // revert/send the transfers for the difference
            // ent is the sender, diffEntity is the receiver
            for (ExchangingEntity diffEntity : EntityDifference) {
                File commonFile = getFileFromSenderToReciever(ent, diffEntity);
                File originFile = ent.getCorrespondingFile(commonFile, diffEntity.getLoadingFiles());
                File newFile = diffEntity.getCorrespondingFile(commonFile, ent.getSendingFiles());

                if (originFile == null) {
                    FileInfoResponse originInfo = ent.getCorrespondingInfo(commonFile, diffEntity.getAllFiles());

                }
                if (newFile == null) {
                    FileInfoResponse newInfo = diffEntity.getCorrespondingInfo(commonFile, ent.getAllFiles());
                }

                if ((ent instanceof TeleportingSatellite && diffEntity instanceof TeleportingSatellite)
                        || (ent instanceof TeleportingSatellite && diffEntity instanceof StandardSatellite)
                        || (ent instanceof TeleportingSatellite && diffEntity instanceof Device)) {

                    // add ent's body to diffEntity's file body and remove the source's t's
                    TeleportingSatellite teleSat = (TeleportingSatellite) ent;

                    commonFile = removeTs(originFile);
                    String commonBody = newFile.getBody().concat(commonFile.getBody());
                    commonFile.setBody(commonBody);

                    teleSat.instantFileTransferTo(commonFile, diffEntity);
                }

                else if (ent instanceof StandardSatellite && diffEntity instanceof TeleportingSatellite) {
                    TeleportingSatellite teleSat = (TeleportingSatellite) diffEntity;

                    commonFile = removeTs(originFile);
                    String commonBody = newFile.getBody().concat(commonFile.getBody());
                    commonFile.setBody(commonBody);

                    teleSat.revertTransferFrom(commonFile, ent);
                }

                else if ((ent instanceof Device && diffEntity instanceof StandardSatellite)
                        || ent instanceof StandardSatellite && diffEntity instanceof Device) {
                    diffEntity.revertTransferFrom(newFile, ent);
                }

                else if (ent instanceof Device && diffEntity instanceof TeleportingSatellite) {
                    TeleportingSatellite teleSat = (TeleportingSatellite) diffEntity;
                    originFile = removeTs(originFile);
                    newFile = removeTs(newFile);

                    String commongBody = originFile.getBody().concat(newFile.getBody());
                    commonFile.setBody(commongBody);

                    teleSat.instantFileTransferTo(commonFile, ent);
                }
            }
        }

    }

    /**
     * Simulate for the specified number of minutes. You shouldn't need to modify
     * this function.
     */
    public void simulate(int numberOfMinutes) {
        for (int i = 0; i < numberOfMinutes; i++) {
            simulate();
        }
    }

    /**
     * Returns a list of all of the entities that are in range and supported
     * @param id
     * @return
     */
    public List<String> communicableEntitiesInRange(String id) {
        Entity entity = getExEntFromId(id);

        if (entity == null) {
            for (RelaySatellite rel : relays) {
                if (id.equals(rel.getId())) {
                    entity = rel;
                }
            }
            return null;
        }

        ArrayList<String> visibleIds = new ArrayList<String>();
        // if entity is a device, add all visSats to visibleIds
        if (entity instanceof Device) {
            Device temp = (Device) entity;

            for (NormalSatellite sat : satellites) {
                if (temp.entIsVis(sat)) {
                    visibleIds.add(sat.getId());
                }
            }
            for (RelaySatellite rel : relays) {
                if (temp.entIsVis(rel)) {
                    visibleIds.add(rel.getId());
                }
            }

        }

        // if entity is a satellite, add visible devices and satellites
        else {
            for (Entity otherEntity : allEntities) {
                if (!otherEntity.getId().equals(id)) {
                    if (entity.entIsVis(otherEntity)) {
                        visibleIds.add(otherEntity.getId());
                    }
                }
            }

        }

        // get rid of the repeats and the original entity id
        visibleIds.stream().distinct().filter(ent -> !ent.equals(id));

        // check for relays in visibleIds and add their visibles if they haven't 
        // been added already
        for (String ID : visibleIds) {
            for (RelaySatellite rel : relays) {
                String idString = rel.getId();
                if (ID.equals(idString)) {
                    communicableEntitiesInRange(idString).stream().distinct().filter(ent -> !ent.equals(idString))
                            .forEach(visibleIds::add);
                }
            }
        }

        // double checking to make sure there are no repeats 
        // or original calling entity's id
        visibleIds.stream().distinct().filter(ent -> !ent.equals(id));

        // if the original entity is a device then, get rid of any deviceIds 
        // from visibleIds
        if (entity instanceof Device) {
            for (String tempId : visibleIds) {
                if (listDeviceIds().contains(tempId)) {
                    visibleIds.remove(tempId);
                }
            }
        }

        return visibleIds;
    }

    /**
     * Sends a file object corresponding to the file name 
     * from the entity given by the fromId to the entity dictated by the 
     * toId
     * Expects that the Id of a relay Satellite won't be given as a 
     * a fromId or toId
     * Expects that the fromId and toId are of existing Normal Satellites
     * Expects that a device will not be sending to another device
     * @param fileName
     * @param fromId
     * @param toId
     * @throws VirtualFileNotFoundException
     * @throws VirtualFileNoBandwidthException
     * @throws VirtualFileAlreadyExistsException
     * @throws VirtualFileNoStorageSpaceException
     */
    public void sendFile(String fileName, String fromId, String toId) throws VirtualFileNotFoundException,
            VirtualFileNoBandwidthException, VirtualFileAlreadyExistsException, VirtualFileNoStorageSpaceException {

        Map<String, FileInfoResponse> subjects = new HashMap<>();
        FileInfoResponse subject = new FileInfoResponse(fileName, "", 0, false);
        ExchangingEntity sender = getExEntFromId(fromId);
        ExchangingEntity reciever = getExEntFromId(toId);
        EntityInfoResponse sendInfo = getInfo(fromId);

        subjects = sendInfo.getFiles();
        for (FileInfoResponse inf : subjects.values()) {
            if (inf.getFilename().equals(fileName)) {
                subject = inf;
            }
        }

        System.out.println(
                "subject: " + subject.getFilename() + ", sender: " + sender.getId() + ", to: " + reciever.getId());

        try {
            sendFileErrorCheck(subject, sender, reciever);

        } catch (VirtualFileNotFoundException noFile) {
            throw noFile;
        } catch (VirtualFileNoBandwidthException noBand) {
            throw noBand;
        } catch (VirtualFileAlreadyExistsException repeatFile) {
            throw repeatFile;
        } catch (VirtualFileNoStorageSpaceException noStorage) {
            // System.out.println(subject.getFilename() + ", " + noStorage.getMessage());
            throw noStorage;
        }

        // if (!sendFileErrorCheck(subject, sender, reciever)) {
        //     System.out.println("There has been an error!!!!!!!!!!!!!");
        //     return;
        // }

        // find the file from the senders currentFiles
        File target = null;
        for (File targ : sender.getCurrentFiles()) {
            if (targ.getFileName().equals(fileName)) {
                target = targ;
                break;
            }
        }

        System.out.println(target.getFileName() + " is the file being recieved by " + reciever.getId());
        reciever.recieveNewFile(target, sender);
    }

    //////////////////// HELPER FUNCTIONS \\\\\\\\\\\\\\\\

    /**
     * Returns false if there were no errors or exceptions thrown
     * @param sub
     * @param form
     * @param to
     * @return
     */
    public boolean sendFileErrorCheck(FileInfoResponse sub, ExchangingEntity from, ExchangingEntity to)
            throws VirtualFileNotFoundException, VirtualFileNoBandwidthException, VirtualFileAlreadyExistsException,
            VirtualFileNoStorageSpaceException {

        int count = 0;
        if (getSendingFileFromName(sub.getFilename()) == null) {
            count++;
            throw new FileTransferException.VirtualFileNotFoundException(sub.getFilename() + " does not exist");
        }

        // bandwidth error checking
        if (from.getSendingFiles().size() == from.getBandwidthOut()) {
            count++;
            throw new FileTransferException.VirtualFileNoBandwidthException(from.getId() + " - not enough bandwidth");
        }
        if (to.getLoadingFiles().size() == to.getBandwidthIn()) {
            count++;
            throw new FileTransferException.VirtualFileNoBandwidthException(to.getId() + " - not enough bandwidth");
        }

        // communicable entity eror checking
        List<String> reachables = communicableEntitiesInRange(from.getId());
        if (!reachables.contains(to.getId())) {
            System.out.println("Destination is not reachable");
            count++;
        }

        //File already exists error checking
        System.out.println(to.getAllFiles() + " is the map of all files from " + to.getId());
        System.out.println("Looking for " + sub.getFilename());
        if (to.getAllFiles().containsKey(sub.getFilename())) {
            count++;
            throw new FileTransferException.VirtualFileAlreadyExistsException(
                    to.getId() + " already has " + sub.getFilename());
        }

        if (count > 0) {
            return true;
        }

        return false;
    }

    /**
    * Gets the entity that is currently sending the file with the given name
    * Assumes that the file name given is valid
    * @param name
    * @return
    */
    public ExchangingEntity getSenderFromFileName(String name) {
        ExchangingEntity entity = null;
        for (ExchangingEntity ent : entities) {
            if (ent.getSendingFiles().contains(getSendingFileFromName(name))) {
                entity = ent;
            }
        }

        return entity;
    }

    /**
     * Gets the appropriate entity from the given id
     * @param id
     * @return
     */
    public ExchangingEntity getExEntFromId(String id) {
        ExchangingEntity entity = null;
        for (ExchangingEntity ent : entities) {
            if (ent.getId().equals(id)) {
                entity = ent;
            }
        }

        return entity;
    }

    /**
     * Get the file being sent with the given name
     * @param name
     * @return
     */
    public File getSendingFileFromName(String name) {
        File file = null;
        for (ExchangingEntity ent : entities) {
            for (FileInfoResponse inf : ent.getAllFiles().values()) {
                if (inf.getFilename().equals(name)) {
                    file = new File(inf.getData(), inf.getFilename(), false);
                    return file;
                }
            }
        }
        return file;
    }

    /**
     * Gets the original version of the file that is
     * being sent between the given sender and receiver
     * @param sender
     * @param receiver
     * @return
     */
    public File getFileFromSenderToReciever(ExchangingEntity sender, ExchangingEntity receiver) {
        File returnFile = null;
        List<File> sends = sender.getSendingFiles();
        List<File> gets = receiver.getLoadingFiles();

        for (File sendFile : sends) {
            returnFile = receiver.getCorrespondingFile(sendFile, gets);
        }

        return returnFile;
    }

    /**
     * Return a file with the body of the newFile 
     * plus the body of the sourceFile without any
     * t's
     * @param sourceFile
     * @param newFile
     * @return
     */
    public File removeTs(File sourceFile) {
        String newSourceBody = sourceFile.getBody();
        newSourceBody.replace(String.valueOf('t'), "");

        sourceFile.setBody(newSourceBody);

        return sourceFile;
    }

    //////////////// DNF \\\\\\\\\\\\\\\\\

    public void createDevice(String deviceId, String type, Angle position, boolean isMoving) {
        createDevice(deviceId, type, position);
    }

    public void createSlope(int startAngle, int endAngle, int gradient) {
    }
}
