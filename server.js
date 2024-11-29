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

// const lessons = [];
// let images = [];
// const IMAGES_LIMIT = 5;

// const saveImage = (dataURL) => {
//   if (dataURL.indexOf("http") === 0) {
//     return dataURL;
//   }

//   const [head, body] = dataURL.split(",");
//   const [, ext = ""] = head.match(/^data:image\/(.+);base64$/) || [];

//   const hash = crypto.createHash("md5").update(body).digest("hex");
//   const filename = `${hash}.${ext}`;

//   images.push({ filename, body });
//   images = images.slice(-IMAGES_LIMIT);

//   images[filename] = body;

//   return `https://vue-lessons-api.herokuapp.com/img/${filename}`;
// };

// app.get("/img/:filename", (req, res) => {
//   const { filename } = req.params;
//   const [, ext] = filename.split(".");
//   const img = images.find((m) => m.filename === filename);
//   if (img) {
//     const data = Buffer.from(img.body, "base64");
//     res.set("Content-Type", `image/${ext}`);
//     res.send(data);
//   } else {
//     res.send("Image outdated. please re-upload");
//   }
// });

// app
//   .route("/")
//   .post((req, res) => {
//     const image = saveImage(req.body.image);
//     const data = _.omit(req.body, "image");
//     const id = lessons.length;
//     const lesson = _.assign(data, { id, image });
//     lessons.push(lesson);
//     res.json({ id });
//   })
//   .get((req, res) => {
//     res.json(lessons);
//   });

// app
//   .route("/:id")
//   .get((req, res) => {
//     res.json(lessons.find((n) => n.id == req.params.id));
//   })
//   .put((req, res) => {
//     const image = saveImage(req.body.image);
//     const data = _.omit(req.body, "image");
//     const id = req.params.id;
//     const lesson = _.find(lessons, { id });
//     if (!lesson) {
//       res.json({ success: false });
//     } else {
//       _.assign(lesson, data, { image });
//       res.json({ success: true });
//     }
//   });

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

// app.post("/auth/login", (req, res) => {
//   const { username, password } = req.body;
//   const content = {};
//   let statue_code = 200;
//   const user = users.find(
//     (u) => u.username === username && u.password === password
//   );
//   if (user) {
//     content["data"] = {
//       name: user.name,
//       token: "636b6030-3ee3-11eb-b378-0242ac130002",
//     };
//   } else {
//     statue_code = 403;
//     content["error_message"] = {
//       username: "找不到該使用者",
//     };
//   }
//   res.status(statue_code).send(content);
// });

// app.post("/testToken", (req, res) => {
//   const token = req.headers.authorization;
//   let statue_code = 200;
//   const content = {};
//   if (token === "636b6030-3ee3-11eb-b378-0242ac130002") {
//     content["success"] = "ok";
//   } else {
//     statue_code = 403;
//     content["error_message"] = "無效的 token";
//   }
//   res.status(statue_code).send(content);
// });

// app.get("/exists/:username", (req, res) => {
//   const { username } = req.params;
//   const user = users.find((u) => u.username === username);
//   res.json({
//     exists: user !== undefined,
//   });
// });
// // ================================================================
// app.get("/photo/list", (req, res) => {
//   if (req.query.status === "error") {
//     res.status(403).send({ error_msg: "未知的錯誤" });
//     return;
//   }
//   res.json([
//     { url: "https://picsum.photos/500/300?random=1" },
//     { url: "https://picsum.photos/500/300?random=2" },
//     { url: "https://picsum.photos/500/300?random=3" },
//     { url: "https://picsum.photos/500/300?random=4" },
//     { url: "https://picsum.photos/500/300?random=5" },
//     { url: "https://picsum.photos/500/300?random=6" },
//     { url: "https://picsum.photos/500/300?random=7" },
//   ]);
// });
// app.get("/dom/content", (req, res) => {
//   res.json({ html: htmlContent });
// });
// // ================================================================

// app.get("/city/list", (req, res) => {
//   res.json(cityJson);
// });
// const userAuth = [
//   {
//     username: "mike",
//     password: "123456789",
//     sex: "boy",
//     email: "qwer@gmail.com",
//     age: "12",
//     terms: false,
//   },
// ];

// app.post("/auth/registered", (req, res) => {
//   const { username, password, sex, email, age, terms } = req.body;
//   const user_email = userAuth.find((u) => u.email === email);
//   const user_name = userAuth.find((u) => u.username === username);
//   const regex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})*$/;
//   const errMsg = {};
//   if (password.length < 6) {
//     errMsg["password"] = "密碼長度須超過6個字元";
//   }
//   if (username === "") {
//     errMsg["username"] = "使用者名稱不得為空";
//   }
//   if (password === "") {
//     errMsg["password"] = "密碼不得為空";
//   }
//   if (email === "") {
//     errMsg["email"] = "email不得為空";
//   }
//   if (!regex.test(email)) {
//     errMsg["email"] = "請輸入正確的email格式";
//   }
//   if (user_email) {
//     errMsg["email"] = "此email已註冊過";
//   }
//   if (user_name) {
//     errMsg["username"] = "此使用者名稱已註冊過";
//   }
//   let status_code = Object.keys(errMsg).length === 0 ? 200 : 403;
//   const content = {
//     success: status_code === 200,
//   };
//   if (status_code === 200) {
//     content["data"] = { username, password, sex, email, age, terms };
//   } else {
//     content["error_message"] = errMsg;
//   }
//   res.status(status_code).send(content);
// });

// // =================================================================
// app.get("/courses/list", (req, res) => {
//   res.json(coursesJson);
// });

// app.get("/courses/:id", (req, res) => {
//   const { id } = req.params;
//   const isId = ["286", "419", "418"].includes(id);
//   const status_code = isId ? 200 : 403;
//   const content = {};
//   if (status_code === 200) {
//     content["data"] = coursesJson.filter((item) => `${item.id}` === id);
//   } else {
//     content["error_message"] = "找不到此課程";
//   }
//   res.status(status_code).send(content);
// });

// // =================================================================

// const seoMap = {
//   home: {
//     title: "Nuxt3 高效入門全攻略",
//     description:
//       "最棒的Nuxt3的線上課程、Nust3、Vue3、JavaScript、線上課程、程式",
//     ogImage: "https://picsum.photos/500/300?random=1",
//   },
//   about: {
//     title: "關於我們 - Nuxt3 高效入門全攻略",
//     description:
//       "關於我們、最棒的Nuxt3的線上課程、Nust3、Vue3、JavaScript、線上課程、程式",
//     ogImage: "https://picsum.photos/500/300?random=2",
//   },
//   user: {
//     title: "USER - Nuxt3 高效入門全攻略",
//     description:
//       "USER、最棒的Nuxt3的線上課程、Nust3、Vue3、JavaScript、線上課程、程式",
//     ogImage: "https://picsum.photos/500/300?random=3",
//   },
// };

// app.get("/seo/:metatage", (req, res) => {
//   const { metatage } = req.params;
//   res.json(seoMap[metatage]);
// });

// // ====投票用 API=============================================================
// const voteList = {
//   vue: {
//     path: `https://vue-lessons-api.vercel.app/images/Vue.svg`,
//     name: "vue",
//     count: 0,
//   },
//   react: {
//     path: `https://vue-lessons-api.vercel.app/images/React.svg`,
//     name: "react",
//     count: 0,
//   },
//   angular: {
//     path: `https://vue-lessons-api.vercel.app/images/Angular.svg`,
//     name: "angular",
//     count: 0,
//   },
// };

// app.get("/vote/list", (req, res) => {
//   res.json(voteList);
// });

// app.post("/vote/add", (req, res) => {
//   const { type } = req.body;
//   voteList[type].count++;
//   res.json(voteList);
// });

// // ==== filter tag =============================================================

// app.get("/nav/tags", (req, res) => {
//   res.json(filterTag);
// });

// // http://localhost:9527/nav/tags/product?tag=frontEnd&child=vue
// app.get("/nav/tags/product", (req, res) => {
//   const { tag, child } = req.query;
//   if (tag && child) {
//     const filterList = productList.filter((item) => {
//       return item.tags.includes(tag) && item.tags.includes(child);
//     });
//     res.json(filterList);
//     return;
//   }
//   if (tag) {
//     const filterList = productList.filter((item) => {
//       return item.tags.includes(tag);
//     });
//     res.json(filterList);
//     return;
//   }
//   res.json(productList);
// });

// app.get("/members/list", (req, res) => {
//   const { no } = req.query
//   if (no) {
//     const filterList = memberLists.filter((item) => {
//       return item.no == no
//     });
//     res.json(filterList);
//     return;
//   }
//   res.json(memberLists)
// })

app.listen(PORT, () => console.log(`app started at http://${HOST}:${PORT}`));