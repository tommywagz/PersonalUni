package unsw.blackout;

import unsw.response.models.FileInfoResponse;

public class File {
    public String body;
    public String fileName;
    public int length;
    public boolean isComplete;

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public int getLength() {
        return length;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public boolean isComplete() {
        return isComplete;
    }

    public void setComplete(boolean isComplete) {
        this.isComplete = isComplete;
    }

    public File(String body, String fileName, boolean finished) {
        this.body = body;
        this.fileName = fileName;
        this.length = body.length();
        this.isComplete = finished;
    }

    public FileInfoResponse getInfo() {
        FileInfoResponse info = new FileInfoResponse(getFileName(), getBody(), getLength(), isComplete());
        return info;
    }

}

