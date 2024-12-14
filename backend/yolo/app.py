from flask import Flask, request, jsonify, send_file,Response
from models.experimental import attempt_load
from utils.datasets import LoadImages
from utils.general import non_max_suppression, scale_coords
import torch
import cv2
import os
import numpy as np
from werkzeug.utils import secure_filename
from flask_cors import CORS
import tempfile
from queue import Queue

# Initialize Flask app
app = Flask(__name__)
CORS(app)
log_queue = Queue()
# Constants
MODEL_PATH = r"C:\Users\VARUN\OneDrive\Desktop\Face-Authentication-main\backend\yolo\yolo-crowd.pt"
UPLOAD_FOLDER = r"C:\Users\VARUN\OneDrive\Desktop\Face-Authentication-main\backend\uploads"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg','mp4', 'avi', 'mov', 'mkv'}
OUTPUT_VIDEO_PATH = os.path.join(UPLOAD_FOLDER, "output_video.mp4")
OUTPUT_IMAGE_PATH = os.path.join(UPLOAD_FOLDER, "output.jpg")
IMG_SIZE = 640
OUTPUT_FOLDER = r"C:\Users\VARUN\OneDrive\Desktop\Face-Authentication-main\backend\output_videos"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Load YOLO model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = attempt_load(MODEL_PATH, map_location=device)

# Check if file extension is allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/detect', methods=['POST'])
def detect_crowd():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Process the uploaded image
        dataset = LoadImages(file_path, img_size=IMG_SIZE)
        for path, img, im0s, vid_cap in dataset:
            img = torch.from_numpy(img).to(device).float() / 255.0
            img = img.unsqueeze(0) if img.ndimension() == 3 else img

            pred = model(img)[0]
            pred = non_max_suppression(pred, conf_thres=0.25, iou_thres=0.45)

            num_detections = len(pred[0]) if pred[0] is not None else 0

            if pred[0] is not None:
                pred[0] = pred[0].cpu()
                for det in pred[0]:
                    *xyxy, conf, cls = det
                    x1, y1, x2, y2 = scale_coords(img.shape[2:], torch.tensor([xyxy]), im0s.shape).round()[0]
                    x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])
                    cv2.rectangle(im0s, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    label = f'{conf:.2f}'
                    cv2.putText(im0s, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 2)

            # Save output image
            cv2.imwrite(OUTPUT_IMAGE_PATH, im0s)

        return jsonify({"detections": num_detections, "output_image": OUTPUT_IMAGE_PATH}), 200
    else:
        return jsonify({"error": "Unsupported file format"}), 400

@app.route('/get-output-image', methods=['GET'])
def get_output_image():
    if os.path.exists(OUTPUT_IMAGE_PATH):
        return send_file(OUTPUT_IMAGE_PATH, mimetype='image/jpeg')
    else:
        return jsonify({"error": "Output image not found"}), 404



OUTPUT_VIDEOS_DIR=r":C:\Users\VARUN\OneDrive\Desktop\Face-Authentication-main\backend\YOLO-CROWD\output_videos"




@app.route('/video-detect', methods=['POST'])
def video_detect():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Initialize video processing
        dataset = LoadImages(filepath, img_size=IMG_SIZE)
        video_writer = None
        frame_width, frame_height = None, None
        total_frames = 0
        total_detections = 0

        output_video_path = os.path.join(OUTPUT_FOLDER, f"processed_{filename}")
        for path, img, im0s, vid_cap in dataset:
            img = torch.from_numpy(img).to(device).float() / 255.0
            img = img.unsqueeze(0) if img.ndimension() == 3 else img

            pred = model(img)[0]
            pred = non_max_suppression(pred, conf_thres=0.25, iou_thres=0.45)

            # Count detections
            num_detections = len(pred[0]) if pred[0] is not None else 0
            total_detections += num_detections
            total_frames += 1

            # Log the current frame's detection count
            log_message = {
                "frame": total_frames,
                "detections": num_detections,
            }
            log_queue.put(log_message)

            # Initialize video writer
            if video_writer is None:
                frame_height, frame_width = im0s.shape[:2]
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec
                video_writer = cv2.VideoWriter(output_video_path, fourcc, vid_cap.get(cv2.CAP_PROP_FPS), (frame_width, frame_height))

            # Draw bounding boxes
            if pred[0] is not None:
                pred[0] = pred[0].cpu()
                for det in pred[0]:
                    *xyxy, conf, cls = det
                    x1, y1, x2, y2 = scale_coords(img.shape[2:], torch.tensor([xyxy]), im0s.shape).round()[0]
                    x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])
                    cv2.rectangle(im0s, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    label = f'{conf:.2f}'
                    cv2.putText(im0s, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 2)

            video_writer.write(im0s)

        # Release video writer
        if video_writer:
            video_writer.release()

        # Calculate average detections per frame as an integer
        average_detections = int(total_detections / total_frames) if total_frames > 0 else 0

        return jsonify({
            "message": f"Video '{filename}' processed successfully!",
            "output_video": f"processed_{filename}",
            "total_detections": total_detections,
            "total_frames": total_frames,
            "average_detections": average_detections
        }), 200

    return jsonify({"error": "File upload failed"}), 500


@app.route('/logs', methods=['GET'])
def stream_logs():
    """Stream logs to the frontend using SSE."""
    def generate_logs():
        while True:
            log_message = log_queue.get()
            yield f"data: {log_message}\n\n"

    return Response(generate_logs(), content_type='text/event-stream')


# @app.route('/get-output-video/<filename>', methods=['GET'])
# def get_output_video(filename):
#     """Stream the processed video to the frontend with byte range support."""
#     video_path = os.path.join(OUTPUT_FOLDER, filename)
#     if not os.path.exists(video_path):
#         return jsonify({"error": "File not found"}), 404

#     range_header = request.headers.get('Range', None)
#     if not range_header:
#         return send_file(video_path, mimetype="video/mp4")

#     # Parse the Range header
#     size = os.path.getsize(video_path)
#     byte_start, byte_end = 0, size - 1
#     if range_header:
#         match = re.search(r'bytes=(\d+)-(\d*)', range_header)
#         if match:
#             byte_start = int(match.group(1))
#             if match.group(2):
#                 byte_end = int(match.group(2))

#     length = byte_end - byte_start + 1
#     with open(video_path, 'rb') as video_file:
#         video_file.seek(byte_start)
#         data = video_file.read(length)

#     response = Response(data, status=206, mimetype="video/mp4")
#     response.headers.add("Content-Range", f"bytes {byte_start}-{byte_end}/{size}")
#     response.headers.add("Accept-Ranges", "bytes")
#     return response


@app.route('/get-output-video/<filename>', methods=['GET'])
def get_output_video(filename):
    """Stream the processed video to the frontend."""
    
    # Safely join the folder and filename
    video_path = os.path.join(OUTPUT_FOLDER, filename)
    
    # Check if the video file exists
    if not os.path.exists(video_path):
        return jsonify({"error": "File not found"}), 404

    try:
        # Stream the video file (not as an attachment, so it plays in the browser)
        return send_file(
            video_path,
            as_attachment=True,  # Ensures it opens in the browser
            mimetype='video/mp4',  # Specify correct MIME type
            download_name=filename  # Disable caching for fresh video content every time
        )
    except Exception as e:
        # Catch errors and log
        print(f"Error streaming video: {e}")
        return jsonify({"error": "Unable to stream video"}), 500




if __name__ == '__main__':
    app.run(port=5002)
