ffmpeg -framerate 24 -i out/frame%d.ppm -c:v libx264 -vf "format=yuv420p" output.mp4
