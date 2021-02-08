import React, { useCallback } from 'react';
import styled from 'styled-components';
import socketIoClient from 'socket.io-client';
import socketIoStream from 'socket.io-stream';
import { SERVER_HOST } from './config';
// ffmpeg init.
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({ log: false, progress: (e) => console.log(e) });
// socket init.
const socket = socketIoClient(SERVER_HOST, {
  reconnection: true,
  reconnectionDelay: 1000,
});

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  margin: 0px;
  padding: 0px;
  overflow: hidden;
  position: relative;
  z-index: 0;
`;

const InputFileUploader = styled.input``;

// ffmpeg transcoding.
const transcoding = async (files) => {
  try {
    // is ffmpeg loaded.
    if(!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    let uploadedSize = 0;
    const { name, size, type } = files[0];
    const progressDom = document.getElementById("progress");
    
    console.log(name, size, type);

    // ffmpeg run.
    ffmpeg.FS('writeFile', name, await fetchFile(files[0]));
    await ffmpeg.run("-i", name, name);
    const transFile = ffmpeg.FS("readFile", name);
    const fileBlob = new Blob([transFile.buffer], { type });
    const stream = socketIoStream.createStream();

    // create file upload stream.
    socketIoStream(socket).emit('file', stream, { size, name });
    const blobStream = socketIoStream.createBlobReadStream(fileBlob);
    
    // current progress event.
    blobStream.on('data', (chunk) => {
      uploadedSize = uploadedSize + chunk.length;
      progressDom.innerHTML = (uploadedSize / size * 100).toFixed(0) + "%";
      console.log((uploadedSize / size * 100).toFixed(0) + "%");

      // upload success.
      if(uploadedSize === size) {
        console.log("upload success.");
      }
    });

    // upload stream pipe.
    blobStream.pipe(stream);
  } catch(err) {
    console.log(err);
    return false;
  }
};

const App = () => {
  // call ffmpeg function.
  const ffmpegCall = useCallback( async (e) => {
    await transcoding(e.target.files);
  }, []);

  // use duplicate file upload.
  const valueNull = useCallback((e) => e.target.value = null, []);

  return (
    <Container>
      <InputFileUploader type="file" id="uploader" onChange={ffmpegCall} onClick={valueNull} />
      <span id="progress"></span>
    </Container>
  );
}

export default App;