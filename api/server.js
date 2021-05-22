const _ =require ('lodash');
const express= require("express");
const cors =require("cors");
const mysql = require("mysql");
const bcrypt = require('bcrypt')
const multer = require('multer');
const saltRounds=10
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const app = express();
const path= require('path');
const dotenv =  require('dotenv');
const helmet = require("helmet");


app.use(express.json());
app.use(cors());



// const userRouter = require("../data/routers/user-router");


// router.use("/", userRouter);

app.get("/", (req, res) => {
  res.status(200).json({ server: "up" });
});

const baseURL =  'http://localhost:4001' //`https://yazi-yorums.herokuapp.com`;

app.use(express.static(path.join(__dirname, './public')));

//app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());


const db= mysql.createPool({
  host: "localhost",
  user: "mudek",
  password: "Mudekpassword1.",
  database: "mudek_db",

/*  host: "eu-cdbr-west-01.cleardb.com",
  user: "bd8a5e84b46cc3",
  password: "60d8905d",
  database: "heroku_0b98794dfc4c945",*/
});




app.get("/api/get",(req,res)  =>{
  const sqlSelect= "SELECT * FROM users";
  db.query(sqlSelect,(err,result)=>{
    res.send(result);
  });

});



/*Giris*/
app.post("/api/giris", (req,res) =>{
  const passW= req.body.password;
  const email= req.body.eMail;
  const sqlInsert=  "Select * from users Where email_m = ?;";

  db.query(sqlInsert,[email],(err,result)  =>{
   if(err){
     res.send({err:err});
   }
   if(result.length>0){
   bcrypt.compare(passW,result[0].password_m, (error,response)=>{

      if(response){
      //  req.session.user = result;

         res.send(result);

       }
       else{
         res.send({message:"Wrong Username/password combi!"});
      }


});
}else{
  res.send({message:"User doesnt exist!"});
}

 });

});


/*Giris*/

/*kayıt ol*/

app.get("/api/kayitOl2",(req,res)  =>{

  const sqlSelect= "SELECT user_id FROM users";
  db.query(sqlSelect,(err,result)=>{

    res.send(result);
  });

});



app.post("/api/kayitOl", (req,res) =>{

  const userName= req.body.uname;
  const passW= req.body.password;
  const email= req.body.eMail;
  const alvl= req.body.level;
  const id=req.body.id;
  const sqlInsert=  "INSERT INTO users VALUES (?,?,?,?,?);";


  bcrypt.hash(passW,saltRounds,(err,hash)=>{
    if(err){
      console.log(err);
    }
 db.query(sqlInsert,[id,email,hash,alvl,userName],(err,result)  =>{
   if(err){
     res.send({message:"E-mail adresi kullanılmaktadır."});
   }
   else{
     res.send({message:"Tebrikler! MUDEK sistemine hoşgeldiniz."});
   }
 });
  })
});
/*kayıt ol*/

/*-------------------------ADMIN--------------------------*/

/*uye ekle*/
app.post("/api/admin/uyeEkle", (req,res) =>{

  const userName= req.body.uname;
  const passW= req.body.password;
  const email= req.body.eMail;
  const alvl= req.body.level;
  const id=req.body.id;
  const sqlInsert=  "INSERT INTO users VALUES (?,?,?,?,?);";


  bcrypt.hash(passW,saltRounds,(err,hash)=>{
    if(err){
      console.log(err);
    }
 db.query(sqlInsert,[id,email,hash,alvl,userName],(err,result)  =>{
   if(err){
     res.send({message:"E-mail adresi kullanılmaktadır."});
   }
   else{
     res.send({message:"Üye Ekleme Başarılı!"});
   }
 });
  })
});


/*Üye kaldır*/
app.get("/api/tumUyeler",(req,res)  =>{
  const sqlSelect= "SELECT * FROM users where authlevel_m <> 0 AND authlevel_m <> 7";
  db.query(sqlSelect,(err,result)=>{
    res.send(result);
  });

});

app.post("/api/Admin/uyeKaldir", (req,res) =>{
  const uyeId= req.body.uyeId;


  const sqlInsert=  "UPDATE users set authlevel_m = 7 where user_id = ?;";
 db.query(sqlInsert,[uyeId],(err,result)  =>{
     if(err){
       res.send({message:"Bir Sorun Oluştu."});
       console.log(err)
     }else{
       res.send({message:"KULLANICI KALDIRILDI."});
     }
 });
});

/*Dönem ekle*/
app.post("/api/Admin/donemEkle", (req,res) =>{
  const donemName= req.body.donemName;
  const startDate= req.body.donemStartDate;
  const endDate= req.body.donemEndDate;


  const sqlInsert=  "INSERT INTO semesters (name ,startdate,enddate) VALUES (?,?,?);";
 db.query(sqlInsert,[donemName,startDate,endDate],(err,result)  =>{
     if(err){
       res.send({message:"Bir Sorun Oluştu."});
       console.log(err)
     }else{
       res.send({message:"Dönem Ekleme Başarılı."});
     }
 });
});

/*Donem Kaldır*/


app.post("/api/Admin/donemKaldir", (req,res) =>{
  const donemId= req.body.donemId;


  const sqlInsert=  "Delete from semesters where semester_id = ?;";
 db.query(sqlInsert,[donemId],(err,result)  =>{
     if(err){
       res.send({message:"Bu Dönemde Kayıtlı Dersler Olduğu İçin Kaldırılamıyor."});
       console.log(err)
     }else{
       res.send({message:"DÖNEM KALDIRILDI."});
     }
 });
});

/*şifre değiştir*/
app.post("/api/Admin/sifreDegistir", (req,res) =>{
  const mail= req.body.sifreDegistirMail;
  const yeniSifre = req.body.sifre;

  const sqlInsert=  "UPDATE users set password_m = ? where email_m = ?;";
  bcrypt.hash(yeniSifre,saltRounds,(err,hash)=>{
    if(err){
      console.log(err);
    }
 db.query(sqlInsert,[hash,mail],(err,result)  =>{
     if(err){
       res.send({message:"ŞİFRE DEĞİŞTİRİLEMEDİ."});
       console.log(err)
     }else{
       res.send({message:"ŞİFRE DEĞİŞTİRİLDİ."});
     }
 });
 })
});

/*ders ekle*/
app.post("/api/Admin/dersEkle", (req,res) =>{
  const dersName= req.body.dersName;
  const dersKodu= req.body.dersCode;

  const sqlInsert=  "INSERT INTO lectures (lecture_name,lecture_code) VALUES (?,?);";
 db.query(sqlInsert,[dersName,dersKodu],(err,result)  =>{
     if(err){
       res.send({message:"Bir Sorun Oluştu."});
       console.log(err)
     }else{
       res.send({message:"Ders Ekleme Başarılı."});
     }
 });
});

/*ders kaldır*/
app.post("/api/Admin/dersKaldir", (req,res) =>{
  const dersId= req.body.ders_Id;
  const donemId=req.body.donem_Id;

  const sqlInsert=  "Delete from lecture_det where lecture_id = ? and lecture_sem=?;";
 db.query(sqlInsert,[dersId,donemId],(err,result)  =>{
     if(err){
       res.send({message:"Bir Sorun Oluştu."});
       console.log(err)
     }else{
       res.send({message:"Ders KALDIRILDI."});
     }
 });
});

/*donem görüntüle*/
app.get("/api/donemGoruntule",(req,res)  =>{
  const sqlSelect= "SELECT * FROM semesters";
  db.query(sqlSelect,(err,result)=>{
    res.send(result);
  });

});

/*ders görüntüle*/
app.get("/api/dersGoruntule",(req,res)  =>{
  const sqlSelect= "SELECT * FROM lectures";
  db.query(sqlSelect,(err,result)=>{
    res.send(result);
  });
});


/*
app.post("/api/admin/dersGoruntuleAnaSayfa",(req,res)  =>{
  const donemId=req.body.donem_id;

  const sqlSelect= "SELECT * FROM lecture_det where lecture_sem = ?";
  db.query(sqlSelect,[donemId],(err,result)=>{

    var lecId=-1;
    if(result.length>0){
    lecId=result[0].lecture_id;
  }
    const sqlSelect= "SELECT * FROM lectures where lecture_id = ? ";
    db.query(sqlSelect,[lecId],(err,result)=>{

    res.send(result)
    });

  });

});*/
app.post("/api/admin/dersGoruntuleAnaSayfa",(req,res)  =>{
  const donemId=req.body.donem_id;

  const sqlSelect= "SELECT * FROM lectures where lecture_id in (select lecture_id from lecture_det where lecture_sem = ?)";
  db.query(sqlSelect,[donemId],(err,result)=>{

    res.send(result);

  });

});

app.post("/api/admin/egitmenatabosders",(req,res)  =>{
  const donemId=req.body.donem_id;

  const sqlSelect= "SELECT * FROM lectures where lecture_id not in (select lecture_id from lecture_det where lecture_sem = ?)";
  db.query(sqlSelect,[donemId],(err,result)=>{

    res.send(result);

  });

});





app.get("/api/egitmenler",(req,res)  =>{
  const sqlSelect= "SELECT * FROM users where authlevel_m = 1";
  db.query(sqlSelect,(err,result)=>{
    res.send(result);
  });
});

/*belge görüntüle*/


/*evrak ve fotoğraf görüntüle*/


/*hesap onayla*/
app.get("/api/admin/uyeOnay",(req,res)  =>{
  const sqlSelect= "SELECT * FROM users where authlevel_m = 4 or authlevel_m = 5 or authlevel_m = 6";
  db.query(sqlSelect,(err,result)=>{

    res.send(result);
  });
});





app.post("/api/Admin/uyeOnayGet", (req,res) =>{
  const bekleyenId= req.body.bekleyenId;
  //const yeniLevel=eskiLevel-3;

  const sqlInsert=  "select * from users where user_id = ?;";
 db.query(sqlInsert,[bekleyenId],(err,result)  =>{

     if(err){
       console.log(err)
     }else{
       const bekleyenId=result[0].user_id;
       const level = (result[0].authlevel_m);
       var yeniLevel;
       if(level===4){
         yeniLevel=1
       }else if(level===5){
         yeniLevel=2
       }else if(level===6){
         yeniLevel=3
       }
       const sqlInsert=  "UPDATE users set authlevel_m = ? where user_id = ?;";
      db.query(sqlInsert,[yeniLevel,bekleyenId],(err,result)  =>{
          if(err){
            res.send({message:"Bir Sorun Oluştu."});
            console.log(err)
          }else{
            res.send({message:"ONAYLANDI."});
          }
      });


     }
 });
});


app.post("/api/Admin/uyeRed", (req,res) =>{
  const uyeId= req.body.bekleyenId;


  const sqlInsert=  "Delete from users where user_id = ?;";
 db.query(sqlInsert,[uyeId],(err,result)  =>{
     if(err){
       res.send({message:"Bir Hata Oluştu"});
       console.log(err)
     }else{
       res.send({message:"Üyelik Talebi Reddedildi."});
     }
 });
});

/*
app.post("/api/Admin/uyeOnayla", (req,res) =>{
  const bekleyenId= req.body.bekleyenId;
  const eskiLevel= req.body.level;
  console.log()


  const sqlInsert=  "UPDATE users set authlevel_m = ? where user_id = ?;";
 db.query(sqlInsert,[eskiLevel,bekleyenId],(err,result)  =>{
     if(err){
       res.send({message:"Bir Sorun Oluştu."});
       console.log(err)
     }else{
       res.send({message:"ONAYLANDI."});
     }
 });
});

*/


/* egitmen ata*/
app.post("/api/Admin/egitmenAta", (req,res) =>{
  const donem= req.body.donemId;
  const ders= req.body.dersId;
  const egitmen= req.body.egitmenId;
  const credit =5;
  const sqlInsert=  "INSERT INTO lecture_det (lecture_id,lecture_sem,lecture_inst,lecture_credit) VALUES (?,?,?,?);";
 db.query(sqlInsert,[ders,donem,egitmen,credit],(err,result)  =>{
     if(err){
       res.send({message:"Bir Sorun Oluştu."});
       console.log(err)
     }else{
       res.send({message:"Egitmen Atama Başarılı."});
     }
 });
});


/*-------------------------ADMIN--------------------------*/


/*-------------------------Asistan-----------------------*/
app.post("/api/asistan/donemGoruntule",(req,res)  =>{
  const semesterID=req.body.idrequest;
  const sqlSelect= "SELECT name FROM semesters where semester_id=?";
  db.query(sqlSelect,[semesterID],(err,result)=>{
    res.send(result);

  });

});

/*Evrak yükle*/
const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${__dirname}/./public/depdocs`);
    },
    filename: (req, file, cb) => {
        let lastIndex = file.originalname.lastIndexOf(".");
        // get the original extension of the file
        let extension = file.originalname.substring(lastIndex);
        // Create the file on the server
        cb(null, `document-${Date.now()}${extension}`);
    }
});

const upload2 = multer({ storage:storage2 });


app.post('/api/depdocs/single-upload', upload2.single('file'), async (req, res) => {

    let docPath = req.file.path.replace("public",baseURL);

    docPath = docPath.split('api')[1].substring(1, docPath.length);

    return res.json({
        docPath
    });
});

app.post("/api/asistan/docEkle", (req,res) =>{
  const user_id= req.body.userId;
  const filePath= req.body.path;
  const donem_id= req.body.donem;
  const docName =req.body.name;
  const docExp =req.body.explanation;

  const sqlInsert=  "INSERT INTO department_docs (user_id,path,semester_id,doc_desc,explanation) VALUES (?,?,?,?,?);";
 db.query(sqlInsert,[user_id,filePath,donem_id,docName,docExp],(err,result)  =>{
     if(err){
       res.send({message:"Bir Sorun Oluştu."});
       console.log(err)
     }else{
       res.send({message:"Başarılı."});
     }
 });
});
/*evrak sil*/
app.post("/api/asistan/docsil", (req,res) =>{
  const id= req.body.docId;

  const sqlInsert=  "Delete from department_docs where department_doc_id = ?;";
 db.query(sqlInsert,[id],(err,result)  =>{
     if(err){
       res.send({message:"Bir sorun oluştu."});
       console.log(err)
     }else{
       res.send({message:"Döküman Silindi."});
     }
 });
});


app.post("/api/asistan/docguncelle", (req,res) =>{
  const id= req.body.docId;
  const desc= req.body.desc;
  const exp= req.body.exp;

  const sqlInsert=  "UPDATE department_docs set doc_desc = ? , explanation = ? where department_doc_id = ?;";
 db.query(sqlInsert,[desc,exp,id],(err,result)  =>{
     if(err){
       res.send({message:"Bir sorun oluştu."});
       console.log(err)
     }else{
       res.send({message:"Guncellendi."});
     }
 });
});


/*fotoğraf yükle*/


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${__dirname}/./public/photos`);
    },
    filename: (req, file, cb) => {
        let lastIndex = file.originalname.lastIndexOf(".");
        // get the original extension of the file
        let extension = file.originalname.substring(lastIndex);
        // Create the file on the server
        cb(null, `img-${Date.now()}${extension}`);
    }
});

const upload = multer({ storage });


app.post('/api/images/single-upload', upload.single('file'), async (req, res) => {

    let imagePath = req.file.path.replace("public",baseURL);

    imagePath = imagePath.split('api')[1].substring(1, imagePath.length);

    return res.json({
        imagePath
    });
});



app.post("/api/asistan/fotoEkle", (req,res) =>{
  const user_id= req.body.userId;
  const filePath= req.body.path;
  const donem_id= req.body.donem;
  const fotoName =req.body.name;
  const fotoExp =req.body.explanation;

  const sqlInsert=  "INSERT INTO photos (user_id,path,semester_id,doc_desc,explanation) VALUES (?,?,?,?,?);";
 db.query(sqlInsert,[user_id,filePath,donem_id,fotoName,fotoExp],(err,result)  =>{
     if(err){
       res.send({message:"Bir Sorun Oluştu."});
       console.log(err)
     }else{
       res.send({message:"Başarılı."});
     }
 });
});











/*fotoğraf sil*/
app.post("/api/asistan/fotosil", (req,res) =>{
  const id= req.body.fotoId;


  const sqlInsert=  "Delete from photos where photos_id = ?;";
 db.query(sqlInsert,[id],(err,result)  =>{
     if(err){
       res.send({message:"Bir sorun oluştu."});
       console.log(err)
     }else{
       res.send({message:"Fotoğraf Silindi."});
     }
 });
});


app.post("/api/asistan/fotoguncelle", (req,res) =>{
  const id= req.body.fotoId;
  const desc= req.body.desc;
  const exp= req.body.exp;

  const sqlInsert=  "UPDATE photos set doc_desc = ? , explanation = ? where photos_id = ?;";
 db.query(sqlInsert,[desc,exp,id],(err,result)  =>{
     if(err){
       res.send({message:"Bir sorun oluştu."});
       console.log(err)
     }else{
       res.send({message:"Guncellendi."});
     }
 });
});


/*evrak ve fotoğraf görüntüle*/
app.post("/api/asistan/fotoGoruntule",(req,res)  =>{
  donem_Id=req.body.donemID,
  user_Id=req.body.userID
  const sqlSelect= "SELECT * FROM photos where semester_id=? AND user_id =?";
  db.query(sqlSelect,[donem_Id,user_Id],(err,result)=>{
    res.send(result);
  });

});

app.post("/api/asistan/docGoruntule",(req,res)  =>{
  donem_Id=req.body.donemID,
  user_Id=req.body.userID
  const sqlSelect= "SELECT * FROM department_docs where semester_id=? AND user_id =?";
  db.query(sqlSelect,[donem_Id,user_Id],(err,result)=>{
    res.send(result);
  });

});

app.post("/api/asistan/documanGoruntule",(req,res)  =>{
  id=req.body.docID

  const sqlSelect= "SELECT * FROM department_docs where department_doc_id=?";
  db.query(sqlSelect,[id],(err,result)=>{
    res.send(result);
  });

});



/*-------------------------Asistan------------------------*/


/*-------------------------Eğitmen------------------------*/

  /*sınav dökümanı ekle*/
  const storage3 = multer.diskStorage({
      destination: (req, file, cb) => {
          cb(null, `${__dirname}/./public/examdocs`);
      },
      filename: (req, file, cb) => {
          let lastIndex = file.originalname.lastIndexOf(".");
          // get the original extension of the file
          let extension = file.originalname.substring(lastIndex);
          // Create the file on the server
          cb(null, `document-${Date.now()}${extension}`);
      }
  });

  const upload3 = multer({ storage:storage3 });


  app.post('/api/examdocs/single-upload', upload3.single('file'), async (req, res) => {

      let docPath = req.file.path.replace("public",baseURL);

      docPath = docPath.split('api')[1].substring(1, docPath.length);

      return res.json({
          docPath
      });
  });

  app.post("/api/instructor/examDocEkle", (req,res) =>{
    const lecture_det_id= req.body.lectureDetId;
    const filePath= req.body.path;
    const docName =req.body.name;
    const docExp =req.body.explanation;
    const rank=req.body.examRank;
    const type=req.body.examType;

    const sqlInsert=  "INSERT INTO exam_docs (lecture_det_id,exam_rank,exam_type,path,doc_name,explanation) VALUES (?,?,?,?,?,?);";
   db.query(sqlInsert,[lecture_det_id,rank,type,filePath,docName,docExp],(err,result)  =>{
       if(err){
         res.send({message:"Bir Sorun Oluştu."});
         console.log(err)
       }else{
         res.send({message:"Başarılı."});
       }
   });
  });

  /*sınav dökümanı kaldır*/
  app.post("/api/egitmen/examdocsil", (req,res) =>{
    const id= req.body.docId;

    const sqlInsert=  "Delete from exam_docs where exam_doc_id = ?;";
   db.query(sqlInsert,[id],(err,result)  =>{
       if(err){
         res.send({message:"Bir sorun oluştu."});
         console.log(err)
       }else{
         res.send({message:"Döküman Silindi."});
       }
   });
  });


  app.post("/api/egitmen/examdocguncelle", (req,res) =>{
    const id= req.body.docId;
    const docname= req.body.docname;
    const exp= req.body.exp;
    const type= req.body.type;
    const rank = req.body.rank;
    const sqlInsert=  "UPDATE exam_docs set doc_name = ? , explanation = ?, exam_rank=? , exam_type=? where exam_doc_id = ?;";
   db.query(sqlInsert,[docname,exp,rank,type,id],(err,result)  =>{
       if(err){
         res.send({message:"Bir sorun oluştu."});
         console.log(err)
       }else{
         res.send({message:"Guncellendi."});
       }
   });
  });

  /*Ders içi döküman ekle*/
  const storage4 = multer.diskStorage({
      destination: (req, file, cb) => {
          cb(null, `${__dirname}/./public/lecturedocs`);
      },
      filename: (req, file, cb) => {
          let lastIndex = file.originalname.lastIndexOf(".");
          // get the original extension of the file
          let extension = file.originalname.substring(lastIndex);
          // Create the file on the server
          cb(null, `document-${Date.now()}${extension}`);
      }
  });

  const upload4 = multer({ storage:storage4 });


  app.post('/api/lecturedocs/single-upload', upload4.single('file'), async (req, res) => {

      let docPath = req.file.path.replace("public",baseURL);

      docPath = docPath.split('api')[1].substring(1, docPath.length);

      return res.json({
          docPath
      });
  });

  app.post("/api/instructor/lectureDocEkle", (req,res) =>{
    const lecture_det_id= req.body.lectureDetId;
    const filePath= req.body.path;
    const docName =req.body.name;
    const docExp =req.body.explanation;


    const sqlInsert=  "INSERT INTO lecture_docs (lecture_det_id,path,doc_desc,doc_name) VALUES (?,?,?,?);";
   db.query(sqlInsert,[lecture_det_id,filePath,docExp,docName],(err,result)  =>{
       if(err){
         res.send({message:"Bir Sorun Oluştu."});
         console.log(err)
       }else{
         res.send({message:"Başarılı."});
       }
   });
  });

  /* anket ekle */

  const storage5 = multer.diskStorage({
      destination: (req, file, cb) => {
          cb(null, `${__dirname}/./public/surveydocs`);
      },
      filename: (req, file, cb) => {
          let lastIndex = file.originalname.lastIndexOf(".");
          // get the original extension of the file
          let extension = file.originalname.substring(lastIndex);
          // Create the file on the server
          cb(null, `document-${Date.now()}${extension}`);
      }
  });

  const upload5 = multer({ storage:storage5 });


  app.post('/api/anketdocs/single-upload', upload5.single('file'), async (req, res) => {

      let docPath = req.file.path.replace("public",baseURL);

      docPath = docPath.split('api')[1].substring(1, docPath.length);

      return res.json({
          docPath
      });
  });

  app.post("/api/instructor/anketDocEkle", (req,res) =>{
    const lecture_det_id= req.body.lectureDetId;
    const filePath= req.body.path;
    const docName =req.body.name;
    const docExp =req.body.explanation;


    const sqlInsert=  "INSERT INTO survey_docs (lecture_det_id,path,doc_desc,doc_name) VALUES (?,?,?,?);";

   db.query(sqlInsert,[lecture_det_id,filePath,docExp,docName],(err,result)  =>{
       if(err){
         res.send({message:"Bir Sorun Oluştu."});
         console.log(err)
       }else{
         res.send({message:"Başarılı."});
       }
   });
  });

  /*anet ekle*/

  /*Ders içi döküman kaldır*/
  app.post("/api/egitmen/lecdocsil", (req,res) =>{
    const id= req.body.docId;

    const sqlInsert=  "Delete from lecture_docs where lecture_doc_id = ?;";
   db.query(sqlInsert,[id],(err,result)  =>{
       if(err){
         res.send({message:"Bir sorun oluştu."});
         console.log(err)
       }else{
         res.send({message:"Döküman Silindi."});
       }
   });
  });


  app.post("/api/egitmen/lecdocguncelle", (req,res) =>{
    const id= req.body.docId;
    const desc= req.body.desc;
    const exp= req.body.exp;

    const sqlInsert=  "UPDATE lecture_docs set doc_name = ? , doc_desc = ? where lecture_doc_id = ?;";
   db.query(sqlInsert,[desc,exp,id],(err,result)  =>{
       if(err){
         res.send({message:"Bir sorun oluştu."});
         console.log(err)
       }else{
         res.send({message:"Guncellendi."});
       }
   });
  });


  /*anket guncelle - sil*/

  app.post("/api/egitmen/anketdocsil", (req,res) =>{
    const id= req.body.docId;

    const sqlInsert=  "Delete from survey_docs where doc_id = ?;";
   db.query(sqlInsert,[id],(err,result)  =>{
       if(err){
         res.send({message:"Bir sorun oluştu."});
         console.log(err)
       }else{
         res.send({message:"Döküman Silindi."});
       }
   });
  });


  app.post("/api/egitmen/anketdocguncelle", (req,res) =>{
    const id= req.body.docId;
    const desc= req.body.desc;
    const exp= req.body.exp;

    const sqlInsert=  "UPDATE survey_docs set doc_name = ? , doc_desc = ? where doc_id = ?;";
   db.query(sqlInsert,[desc,exp,id],(err,result)  =>{
       if(err){
         res.send({message:"Bir sorun oluştu."});
         console.log(err)
       }else{
         res.send({message:"Guncellendi."});
       }
   });
  });


  /*anket doc guncelle  -sil*/

  /*kazanım ekle*/
  app.post("/api/instructor/kazanimEkle", (req,res) =>{
    const lecture_det_id= req.body.lectureDetId;
    const kazanımType =req.body.type;
    const exp =req.body.explanation;


    const sqlInsert=  "INSERT INTO attainments (lecture_det_id,attainment_type,explanation) VALUES (?,?,?);";
   db.query(sqlInsert,[lecture_det_id,kazanımType,exp],(err,result)  =>{
       if(err){
         res.send({message:"Bir Sorun Oluştu."});
         console.log(err)
       }else{
         res.send({message:"Başarılı."});
       }
   });
  });

  /*kazanım kaldır*/
  app.post("/api/egitmen/kazanimsil", (req,res) =>{
    const id= req.body.docId;

    const sqlInsert=  "Delete from attainments where attainments_id = ?;";
   db.query(sqlInsert,[id],(err,result)  =>{
       if(err){
         res.send({message:"Bir sorun oluştu."});
         console.log(err)
       }else{
         res.send({message:"Döküman Silindi."});
       }
   });
  });


  app.post("/api/egitmen/kazanimguncelle", (req,res) =>{
    const id= req.body.docId;
    const exp= req.body.exp;

    const sqlInsert=  "UPDATE attainments set explanation=? where attainments_id = ?;";
   db.query(sqlInsert,[exp,id],(err,result)  =>{
       if(err){
         res.send({message:"Bir sorun oluştu."});
         console.log(err)
       }else{
         res.send({message:"Guncellendi."});
       }
   });
  });

  /*Ders ekle*/
  app.post("/api/egitmen/examDocGoruntule",(req,res)  =>{
    const det_ID=req.body.lecDetID;
    const sqlSelect= "SELECT * FROM exam_docs where lecture_det_id=? ";

    db.query(sqlSelect,[det_ID],(err,result)=>{
      res.send(result);
    });

  });

  app.post("/api/egitmen/examdocumanGoruntule",(req,res)  =>{
    id=req.body.docID

    const sqlSelect= "SELECT * FROM exam_docs where exam_doc_id=?";
    db.query(sqlSelect,[id],(err,result)=>{
      res.send(result);
    });

  });



  app.post("/api/egitmen/lectureDocGoruntule",(req,res)  =>{
    const det_ID=req.body.lecDetID;
    const sqlSelect= "SELECT * FROM lecture_docs where lecture_det_id=? ";

    db.query(sqlSelect,[det_ID],(err,result)=>{
      res.send(result);
    });

  });

  app.post("/api/egitmen/lecturedocumanGoruntule",(req,res)  =>{
    id=req.body.docID

    const sqlSelect= "SELECT * FROM lecture_docs where lecture_doc_id=?";
    db.query(sqlSelect,[id],(err,result)=>{
      res.send(result);
    });

  });


  app.post("/api/egitmen/anketDocGoruntule",(req,res)  =>{
    const det_ID=req.body.lecDetID;
    const sqlSelect= "SELECT * FROM survey_docs where lecture_det_id=? ";

    db.query(sqlSelect,[det_ID],(err,result)=>{
      res.send(result);
    });

  });


  app.post("/api/egitmen/anketdocumanGoruntule",(req,res)  =>{
    id=req.body.docID

    const sqlSelect= "SELECT * FROM survey_docs where doc_id=?";
    db.query(sqlSelect,[id],(err,result)=>{
      res.send(result);
    });

  });



  app.post("/api/egitmen/kazanimGoruntule",(req,res)  =>{
    const det_ID=req.body.lecDetID;
    const sqlSelect= "SELECT * FROM attainments where lecture_det_id=? ";

    db.query(sqlSelect,[det_ID],(err,result)=>{
      res.send(result);
    });

  });

  app.post("/api/egitmen/kazanimiGoruntule",(req,res)  =>{
    id=req.body.docID

    const sqlSelect= "SELECT * FROM attainments where attainments_id=?";
    db.query(sqlSelect,[id],(err,result)=>{
      res.send(result);
    });

  });
  /*app.post("/api/dersGoruntuleAnaSayfa",(req,res)  =>{
    const donemId=req.body.donem_id;
    const egitmenId=req.body.egitmen_id;
    const sqlSelect= "SELECT * FROM lecture_det where lecture_inst=? and lecture_sem = ?";
    db.query(sqlSelect,[egitmenId,donemId],(err,result)=>{
      var sqlSelect= "SELECT * FROM lectures where lecture_id = ? ";
      var lecId=[];
      var counter=0;
      while(result.length>counter){
        lecId.push(result[counter]);
      sqlSelect= sqlSelect+" lecture_id =?";
      counter++;
    }

      db.query(sqlSelect,[lecId.map((val)=>val.lecture_id)],(err,result)=>{
    //    console.log(result[0].lecture_id);
      res.send(result)
      });

    });

  });*/

  app.post("/api/dersGoruntuleAnaSayfa",(req,res)  =>{
    const donemId=req.body.donem_id;
    const egitmenId=req.body.egitmen_id;
    const sqlSelect= "SELECT * FROM lectures where lecture_id in (select lecture_id from lecture_det where lecture_inst=? and lecture_sem = ?)";
    db.query(sqlSelect,[egitmenId,donemId],(err,result)=>{

      res.send(result);

    });

  });



  app.post("/api/egitmen/dersGoruntule",(req,res)  =>{
    const lectureID=req.body.idrequest;
    const sqlSelect= "SELECT lecture_name FROM lectures where lecture_id=?";
    db.query(sqlSelect,[lectureID],(err,result)=>{
      res.send(result);

    });

  });


  app.post("/api/egitmen/lectureDet",(req,res)  =>{
    const lectureID=req.body.dersID;
    const donemID=req.body.donemID;
    const userID=req.body.userID;
    const sqlSelect= "SELECT * FROM lecture_det where lecture_id=? and lecture_sem=? and lecture_inst=?";
    db.query(sqlSelect,[lectureID,donemID,userID],(err,result)=>{
      res.send(result);

    });

  });
  /*Ders kaldır*/
/*-------------------------Eğitmen------------------------*/


/*----------------------Mudek Yetkilisi-------------------*/
/*donem görüntüle*/


/*ders görüntüle*/


/*belge görüntüle*/
app.post("/api/mudek/lectureDet",(req,res)  =>{
  const lectureID=req.body.dersID;
  const donemID=req.body.donemID;
  const sqlSelect= "SELECT * FROM lecture_det where lecture_id=? and lecture_sem=?";
  db.query(sqlSelect,[lectureID,donemID],(err,result)=>{
    res.send(result);

  });

});

/*bölüm evrakları ve fotoğraf görüntüle*/
app.post("/api/mudek/fotoGoruntule",(req,res)  =>{
  const donem_Id=req.body.donemID;
  const sqlSelect= "SELECT * FROM photos where semester_id=? ";
  db.query(sqlSelect,[donem_Id],(err,result)=>{
    res.send(result);
  });

});

app.post("/api/mudek/docGoruntule",(req,res)  =>{
  const donem_Id=req.body.donemID;
  const sqlSelect= "SELECT * FROM department_docs where semester_id=? ";
  db.query(sqlSelect,[donem_Id],(err,result)=>{
    res.send(result);
  });

});

/*----------------------Mudek Yetkilisi-------------------*/
app.post("/api/sifredegistirTest", (req,res) =>{
  const id= req.body.userID;
  const sifre= req.body.eskiSifre;
  const sqlInsert=  "Select * from users Where user_id = ?;";

  db.query(sqlInsert,[id],(err,result)  =>{
   if(err){
     res.send({err:err});
   }
   if(result.length>0){
   bcrypt.compare(sifre,result[0].password_m, (error,response)=>{

      if(response){
      //  req.session.user = result;

         res.send(result);

       }
       else{

         res.send({message:"Eski Şifre Yanlış!"});
      }


});
}
 });

});

app.post("/api/sifredegis", (req,res) =>{
  const id= req.body.userID;
  const yeniSifre = req.body.sifre;

  const sqlInsert=  "UPDATE users set password_m = ? where user_id = ?;";
  bcrypt.hash(yeniSifre,saltRounds,(err,hash)=>{
    if(err){
      console.log(err);
    }
 db.query(sqlInsert,[hash,id],(err,result)  =>{
     if(err){
       res.send({message:"ŞİFRE DEĞİŞTİRİLEMEDİ."});
       console.log(err)
     }else{
       res.send({message:"ŞİFRE DEĞİŞTİRİLDİ."});
     }
 });
})
});





module.exports = app;
