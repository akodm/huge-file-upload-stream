const socketStream = require('socket.io-stream');
// const path = require('path');
// const fs = require('fs');
const moment = require('moment');
const aws = require('aws-sdk');
const stream = require('stream');

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, REGION, BUCKET_NAME } = process.env;

const s3Config = {
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  region: REGION,
};

const s3Client = new aws.S3(s3Config);

// AWS 에 업로드 스트림 연결 함수.
const uploadFromStream = (key) => {
  const pass = new stream.PassThrough();

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    ACL: "public-read",
    Body: pass
  };

  s3Client.upload(params, (err, data) => {
    console.log("err:", err, "data:", data);
  });

  return pass;
};

module.exports = (io) => {
  try {
    io.sockets.on("connection", (socket) => {
      console.log(socket.id);
  
      // 파일을 전송 받았을 떄 이벤트.
      socketStream(socket).on('file', (stream, data) => {
        const date = moment(new Date()).format("YYYY-MM-DD-ddd");
        const time = moment(new Date()).format("x");
        const dirPath = `upload/${date}`;
        
        console.log("file info:", data);

        // AWS S3 에 저장하는 방법.
        stream.pipe(uploadFromStream(`${dirPath}/${time}_${data.name}`));

        // 파일시스템을 이용하여 현재 로컬에 저장하는 방법.
        // fs.exists(dirPath, (dirExists) => {
        //   if(!dirExists) {
        //     console.log("mkdir:", dirPath);
        //     fs.mkdirSync(dirPath);
        //   } else {
        //     console.log("dir exists.", dirPath);
        //   }
  
        //   const filename = path.join(__dirname, `${dirPath}/${time}_${data.name}`);
        //   stream.pipe(fs.createWriteStream(filename));
        // });
      });
    });
  } catch(err) {
    console.log(err);
  }
};