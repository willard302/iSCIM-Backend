const fs = require('fs');
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const crypto = require("crypto");
const _ = require("lodash");
const htmlContent = require("./html.js");
const cityJson = require("./city.json");
const coursesJson = require("./courses.json");
const filterTag = require("./filterTag.json");
const productList = require("./productList.json");
const userInfo = require("./user.json");
const memberLists = require("./members.json");
const multer = require('multer');

const { PORT = 9527, HOST = "localhost" } = process.env;

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "200kb" }));
app.use(cors());

const users = [
  {
    account: "scars",
    password: "1234567",
    name: "姚偉揚",
  },
  {
    account: "iscim@gmail.com",
    password: "a1234567",
    name: "Nico"
  }
];

const activeTokens = new Set();

app.post("/api/register", (req, res) => {
  const newUser = req.body;

  fs.readFile('user.json', 'utf8', (err, data) => {
    if (err) {
      console.error('load failed', err);
      return res.status(500).json({error: 'cannot read'});
    }

    let users = JSON.parse(data);

    users.push(newUser);

    fs.writeFile('user.json', JSON.stringify(users, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('write failed: ', err);
        return res.status(500).json({error: 'cannot write'});
      };
      res.status(201).json({message: 'write succeeded'})
    })
  });
})

app.post("/api/login", (req, res) => {
  const { account, password } = req.body;
  const user = users.find(
    (u) => u.account === account && u.password === password
  );

  if (user) {
    const token = "636b6030-3ee3-11eb-b378-0242ac130002";
    activeTokens.add(token);
    res.json({
      status: true,
      name: user.name,
      token,
    });
  } else {
    res.json({
      status: false,
      message: "Invalid username or password"
    });
  }
});

app.post("/api/logout", (req, res) => {
  const { token } = req.body;
  if (activeTokens.has(token)) {
    activeTokens.delete(token)
    res.json({
      success: true,
      message: "Logout successful"
    });
  } else {
    res.json({
      success: false,
      message: "Invalid token"
    })
  }
})

app.get("/api/account", (req, res) => {
  return res.json(userInfo)
})

app.put("/api/account", (req, res) => {
  const newData = req.body;
  fs.readFile('user.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({message: '無法讀取'});
    let userList = JSON.parse(data);
    userList.forEach((item, idx) => {
      if (item.email === newData.email) {
        userList[idx] = newData
      }
    })

    console.log(userList)
    fs.writeFile('user.json', JSON.stringify(userList, null, 2), 'utf8', err => {
      if (err) {
        console.error('load failed: ', err);
        return res.status(500).json({message: '無法更新資料'});
      }
      res.json({message: '更新資料成功'})
    })
  })

  // if (!updatedData || !updatedData.id) {
  //   return res.status(400).json({message: 'Invalid data'})
  // }

  // userInfo = {...userInfo, ...updatedData}
  // return res.status(200).json({message: 'Data updated successfully', data: userInfo});
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${Date.now()}${ext}`)
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mimeTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv'];
    if (mimeTypes.includes(file.mimetype)){
      cb(null, true);
    } else {
      cb (new Error("文件類型不支持"))
    }
  }
});

app.post("/api/upload", (req, res) => {
  console.log('req   ', req)
  try {
    res.status(200).json({
      message: 'video upload successful.',
      filePath: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    res.status(400).json({message: error.message});
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({message: `上傳錯誤：${err.message}`});
  } else {
    res.status(400).json({message: err.message})
  }
})

app.listen(PORT, () => console.log(`app started at http://${HOST}:${PORT}`));