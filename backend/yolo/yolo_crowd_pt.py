from models.experimental import attempt_load
import torch
from utils.datasets import LoadImages
from utils.general import non_max_suppression, scale_coords
import cv2  

# Paths
MODEL_PATH = r"C:\Users\VARUN\OneDrive\Desktop\Face-Authentication-main\backend\YOLO-CROWD\yolo-crowd.pt"  # Path to the model
IMAGE_PATH = r"C:\Users\VARUN\OneDrive\Desktop\images.jpeg"  # Path to your image

# Load the model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = attempt_load(MODEL_PATH, map_location=device)  # Load model to the device

# Load the image
img_size = 640  # Input size expected by the model
dataset = LoadImages(IMAGE_PATH, img_size=img_size)

# Perform inference and return the image with detections
def detect_faces_and_return_image():
    for path, img, im0s, vid_cap in dataset:  # Unpack the 4 values returned by LoadImages
        img = torch.from_numpy(img).to(device).float() / 255.0  # Normalize to [0, 1]
        img = img.unsqueeze(0) if img.ndimension() == 3 else img  # Add batch dimension

        pred = model(img)[0]  # Perform inference
        pred = non_max_suppression(pred, conf_thres=0.25, iou_thres=0.45)  # Apply NMS

        # Count detections
        num_detections = len(pred[0]) if pred[0] is not None else 0
        print(f"Number of persons/faces detected: {num_detections}")

        # Visualize: Draw bounding boxes on the image
        if pred[0] is not None:
            pred[0] = pred[0].cpu()  # Move to CPU for visualization
            gn = torch.tensor(im0s.shape)[[1, 0, 1, 0]]  # Image size normalization factor
            for det in pred[0]:  # detections per image
                *xyxy, conf, cls = det
                x1, y1, x2, y2 = scale_coords(img.shape[2:], torch.tensor([xyxy]), im0s.shape).round()[0]  # Scale box coordinates
                x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])  # Convert to integer

                # Draw rectangle on the image
                cv2.rectangle(im0s, (x1, y1), (x2, y2), (0, 255, 0), 2)
                # Optionally, add the label or confidence
                label = f'{conf:.2f}'
                cv2.putText(im0s, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 2)

        # Return the image with bounding boxes and number of detections
        return im0s, num_detections

# Call the function to detect faces and return the image
result_image, detections = detect_faces_and_return_image()

# Optionally, display the result
cv2.imshow("Detected Faces", result_image)
cv2.waitKey(0)
cv2.destroyAllWindows()

# Optionally, save the result
cv2.imwrite("output.jpg", result_image)
