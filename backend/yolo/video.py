from models.experimental import attempt_load
import torch
from utils.datasets import LoadImages
from utils.general import non_max_suppression, scale_coords
import cv2  

# Paths
MODEL_PATH = r"C:\Users\VARUN\OneDrive\Desktop\Face-Authentication-main\backend\YOLO-CROWD\yolo-crowd.pt"  # Path to the model
VIDEO_PATH = r"C:\Users\VARUN\OneDrive\Desktop\Face-Authentication-main\backend\YOLO-CROWD\uploads\c1.mp4"  # Path to your video

# Load the model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = attempt_load(MODEL_PATH, map_location=device)  # Load model to the device

# Load the video
img_size = 640  # Input size expected by the model
dataset = LoadImages(VIDEO_PATH, img_size=img_size)

# Perform inference on the video
def process_video():
    video_writer = None
    frame_width, frame_height = None, None
    total_frames = 0
    total_detections = 0

    for path, img, im0s, vid_cap in dataset:
        img = torch.from_numpy(img).to(device).float() / 255.0  # Normalize to [0, 1]
        img = img.unsqueeze(0) if img.ndimension() == 3 else img  # Add batch dimension

        pred = model(img)[0]  # Perform inference
        pred = non_max_suppression(pred, conf_thres=0.25, iou_thres=0.45)  # Apply NMS

        # Count detections in the current frame
        num_detections = len(pred[0]) if pred[0] is not None else 0
        total_detections += num_detections
        total_frames += 1
        print(f"Frame {total_frames}: Number of persons detected: {num_detections}")

        # Initialize video writer
        if video_writer is None:
            frame_height, frame_width = im0s.shape[:2]
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec
            video_writer = cv2.VideoWriter("output_video.mp4", fourcc, vid_cap.get(cv2.CAP_PROP_FPS), (frame_width, frame_height))

        # Draw bounding boxes on the frame
        if pred[0] is not None:
            pred[0] = pred[0].cpu()  # Move to CPU for visualization
            gn = torch.tensor(im0s.shape)[[1, 0, 1, 0]]  # Image size normalization factor
            for det in pred[0]:  # detections per frame
                *xyxy, conf, cls = det
                x1, y1, x2, y2 = scale_coords(img.shape[2:], torch.tensor([xyxy]), im0s.shape).round()[0]  # Scale box coordinates
                x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])  # Convert to integer

                # Draw rectangle on the frame
                cv2.rectangle(im0s, (x1, y1), (x2, y2), (0, 255, 0), 2)
                # Optionally, add the label or confidence
                label = f'{conf:.2f}'
                cv2.putText(im0s, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 2)

        # Write the processed frame to the video
        video_writer.write(im0s)

        # Optionally, display the frame (comment out if not needed)
        cv2.imshow("Video Detection", im0s)
        if cv2.waitKey(1) == ord('q'):  # Press 'q' to exit early
            break

    # Release resources
    dataset.cap.release()  # Release the video capture
    video_writer.release()  # Release the video writer
    cv2.destroyAllWindows()
    print(f"Total frames processed: {total_frames}, Total persons detected: {total_detections}")

# Process the video
process_video()
