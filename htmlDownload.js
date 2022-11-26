 const client = require('cheerio-httpcli');
 const request = require('request');
 const urlType= require('url');
 const fs = require('fs').promises;
 const fs1 = require('fs');




//메인 url, 파일 저장 경로
var main_url = "";
var savedir = "F:\\";
var param = {};

//다음 페이지 전환 

var main_page_url = main_url+"?start=";
var main_page_list = [];
var main_pageCount;

//파일이 없을 때 파일이름을 사용해서 생성할거임

var fileName = [];
var sourceFileName = [];

//리스트 카운트 
var list_Count = 1;
var list_url = "?page="
var list =  [];
var img_url = [];
var img_fname = [];


//URL 회피
//const httpsurl_img2 ="data-src=\"https://images2";


//정규표현식
const img_reg=/data-src="https:\/\/[imgaes2]+/g; // 이미지 URl 추출 부분
const FileNameReg = /alt="[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/]*[/@/\s/\S]*[)]+/g;
const FileNameReplace3 = /[^一-龥ぁ-ゔァ-ヴー々〆〤가-힇ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\t()\s]+/g;

const logfilePath = "F:\\";
//파일 이름, 이름은 절대 안바뀜 
const logfile = "LogFile.txt";
const filenameLog = "imgfilename.txt";
const errorLogName = "errorLog.txt";


//쓰기 스트림
var FileWriteStream;
// 읽기 스트림
let FilereadStream;

let FileNameLogStream = null;
let errorLogStream = null;

let notDownloadNamePath = "F:\\";
let notDownloadNameLogName="notDownload.txt";
let notDownloadImgNameStream = null;
/*
    ************************FileNameReg************************
    /alt="[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/]*[/@/\s/\S]*[)]+/g

    ************************FileNameReplace3************************

    1.
    /[^/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/\t/(/)/']

    2.
    [^/一-龥/ぁ-ゔ/ァ-ヴー/々〆〤/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/\t/(/)/']

    3.
    [^/一-龥/ぁ-ゔ/ァ-ヴー/々〆〤/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/\t/(/)/s/]+[`~!@#$%^&*_|+\-=?;:'",.<>\{\}\[\]\\\/]

    4.
    [^/一-龥/ぁ-ゔ/ァ-ヴー/々〆〤/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/\t/(/)/\s]

    5.
    [^一-龥ぁ-ゔァ-ヴー々〆〤가-힇ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\t()\s]
*/

/*
    클라이언트 헤더 변경 유저로 속이고 접속
*/
// client.set('headers',{
//     'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
//     'Accept-Charset' : 'utf-8'
// });




//파일 다운로드 함수
//파일 생성 여부 확인 하고 생성 또는 넘어감 
async function createDir(DirNamePath){
    
    try {
        await fs.readdir(DirNamePath)
       
    } catch (error) {
        if(error.code === 'ENOENT'){
            console.log('폴더 없음');
            new Promise(function(){ fs.mkdir(DirNamePath);}) 
            
        }
    }
    
     
 }

 //파일 다운로드 
function file_download(fileName,filePath,imgUrl){
    var File_Path = filePath + fileName+".jpg";
    return new Promise(function(resolve,reject){
        request(imgUrl).pipe(fs1.createWriteStream(File_Path));

        setTimeout(function(){
            resolve();
        },500);
    })
    
}
//파일의 메인 경로, 항상 지정된 경로에 저장 
//현재는 임시로 지정

function FileAccessCheck(Path,File)
{ //파일 확인 없으면 생성, 동기처리
    //반환값 1 -> 있음, 0 -> 없음
    try {
        fs1.readFileSync(Path+File)
        return 1;
    } catch (error) {
        if(error.code == "ENOENT")
        {
            return 0;
        }
    }
}

let uploadFile = null;
function CreateFileUploadStream(Path,File) 
{ // 컴퓨터 -> 프로그램
    try {
        let Fpath = Path+File;
        if(uploadFile == null)
        {
            FileAccessCheck(Fpath);
            uploadFile = fs1.readFileSync(Fpath,{encoding:'utf-8',flag:'r'});
            
        }

    } catch (error) {
        
    }
    

}
let uploadFileArry = [];


//;
function downloadFiletoUpload() {
    CreateFileUploadStream(logfilePath,logfile);
    var str = "";
    for(var i=0;i<uploadFile.length;i++){
        if(uploadFile[i] != '\n')
        {
            str += uploadFile[i];
        } else {
            //console.log(str);
            uploadFileArry.push(str);
            str = "";
        }
        
    }

    
}
//데이터가 10000 이상이면 hash > 이분탐색 생각중 
//데이터가 10000 미만이면 선형탐색 
function stringEquals(target)
{
    //일치하면 1, 일치하지 않으면 0
    for(var i= 0;i<uploadFileArry.length;i++)
    {
        if(target == uploadFileArry[i])
        {
            return 1;
        }
    }
    return 0;
}

async function fileDownloadLog(fileName)
{ // 프로그램 -> 컴퓨터
    try {
        if(FileNameLogStream == null)
        {
            let FilePath = logfilePath+logfile;
            FileNameLogStream =  fs1.createWriteStream(FilePath,{flags:'a+'})

        }
        FileNameLogStream.write(fileName+"\n");

    } catch (error) {
        console.log("errorMessageLog : \n"+error);
    }
}
//에러메시지를 errorLog.txt에 출력
//비동기 처리  
async function errorMessageLog(error,Path,fileName)
{
    try {
        
        if(errorLogStream == null)
        {
            let FilePath = Path+fileName;
            errorLogStream = fs1.createWriteStream(FilePath,{flags:'a+'})
        }
        errorLogStream.write(error+"\n")
    } catch (error) {
        console.log("errorMessageLog : \n"+error);
    }
    
    
}
async function notDownloadImgName(FileName)
{
    try {
        if(notDownloadImgNameStream == null)
        {
            let FilePath = notDownloadNamePath+notDownloadNameLogName;
            notDownloadImgNameStream =  fs1.createWriteStream(FilePath,{flags:'a+'});
        }
        notDownloadImgNameStream.write(FileName+"\n");
    } catch (error) {
        console.log("errorMessageLog : \n"+error);
    }
}

function div_item_thumb(item)
{
    /*
        //alt = 파일 제목으로 쓸꺼임
        로그에 저장할 원본을 남겨둬서 로그에 저장해야함 

    */
    try {
        item.match(FileNameReg)
        .forEach((idx)=>{
            fileName.push(idx.replace("alt=\"","").replace(":","").replace(FileNameReplace3,""));
        })
        
        
    } catch (error) {
        //console.log(item);
        errorMessageLog(error+item,logfilePath,errorLogName);
    }
    //원본 파일 이름을 저장할 필요 있음
    try {
        item.match(/alt="[^>]+/g)
        .forEach((idx)=>{
            sourceFileName.push((idx.replace("alt=","").replace(/"+/g,"")))
        });
    } catch (error) {
        errorMessageLog(error+item,logfilePath,errorLogName);
    }

    /*
        ******************** RegExp ******************** 
        href="\/[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/-|-–-]+[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/]
        ******************** RegExp ******************** 

        
    */
    try {
        item.match(/href="\/.+/g)
        .forEach((idx) =>{
            main_page_list.push(idx.replace("href=\"","").replace("\">",""));
        })
    } catch (error) {
        //console.log(item);
        errorMessageLog(error+item,logfilePath,errorLogName);
    }
    
}


// 비동기 처리 -> 동기 처리로 변경 
//async await promise
function mainPageFunc(mainpageUrl)
{
    return new Promise(function(resolve,reject){
        client.fetch(mainpageUrl,param,function(err,$,res)  {
            if(err) { console.log("Error:",err); return}

            try {
                $(".item-thumb").each(function(idx){
                    var item = $(this).html();
                    div_item_thumb(item);
                })
            } catch (error) {
                console.log(error)
                
            }
            
            setTimeout(function(){
                resolve();
            }, 500)

            
        })
    })
}
function div_pagination(item)
{
    item.match(/href="\/[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/-|-–-]+[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/]+/g)
    .forEach((idx) =>{
        list.push(idx.replace("href=\"",""));
        //리스트 추출 부분 / 2를 해줘야함 
    })
}
function div_article_fulltext(item)
{
    if(item.search(img_reg) != -1)
    {
        /*
        item.match(/data-src="https:\/\/[/a-zA-Z/0-9/-]+[/a-zA-Z/0-9/-/./?/=/&/;/_/%/-]+/g)
        .forEach((idx)=>{
                        img_url.push(idx.replace("data-src=\"",""));
        })

        https+[a-z/A-Z/0-9/./%/_/-]+
        (idx.replace(/%3A+/g,":").replace(/%2F+/g,"/"))
        */
        try {
            item.match(/data-src="https:\/\/images2[^"]+/g)
            .forEach((idx) =>{
            img_url.push((idx.replace(/data-src="/g,"")))
        })
        } catch (error) {
            
        }
        
        //alt="[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/_/./-/\s/:/(/)-/;/&/"/]
        //alt="[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/_/./-/\s/:/(/)-]
        //alt=".+
        // try {
        //     item.match(/alt=".[^>]+/g)
        //     .forEach((idx)=>{        
        //     img_fname.push((idx.replace("alt=\"","")).replace(":","").replace(/\"+/g,""));
        // });
        // } catch (error) {
            
        // }
        //image2 이면 다운 받지 않고 파일 이름만 다운 받는다
    } else {
        //data-src="https:\/\/cdn[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/_/./-]+
        try {
            item.match(/data-src="https:\/\/cdn[^>"]+/g)
            .forEach((idx)=>{
            img_url.push(idx.replace("data-src=\"",""));
        });
        } catch (error) {
            
        }
        
        //alt="[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/_/./-/\s/:/(/)-/;/&/"/]
        //alt="[/一-龥/가-힇ㄱ-ㅎㅏ-ㅣ/a-zA-Z/0-9/_/./-/\s/:/(/)-]
        try {
            
            item.match(/alt=".[^>]+/g)
            .forEach((idx)=>{  
            img_fname.push((idx.replace("alt=\"","")).replace(/"+/g,"").replace(":","").replace(/<+/g,"").replace(/>+/g,"").replace(/:+/g,"").replace(/\|+/g,"").replace(/\\\/+/g,"").replace(/\*+/g,""));
        });
        } catch (error) {
            
        }
        
    }
}

//메인페이지 URL page=? 사용하는 함수
function imgPageFunc(FileName,urlPath)
{
    return new Promise(function(resolve,reject){

        client.fetch(urlPath,param,function(err,$,res) {
            

            if(err) { console.log("Error:",err); return}

            //다음 node로 넘어가면 리스트를 초기화 해야함
            if(!list.length)
            {
                $(".pagination").each(function(idx){
                    var item = $(this).html();
                    div_pagination(item);
                    
                })
                
            }
            //이미지 URl 추출 부분
            $(".article-fulltext").each(function(idx){
                var item = $(this).html();

                div_article_fulltext(item)
                
    
            })
            

            setTimeout(function(){
                resolve();
            },500)
            
        })
    })
    
    
}



async function func(){
     /*
     mainPageFunc함수 리턴 값 
        fileName : 디렉토리 파일 이름으로 사용할 변수를 저장 
        main_page_list : 페이지의 이미지 리스트 
    */
    /*
        imgPageFunc 함수 리턴 값 
        list : 이미지 파일이 다음 페이지까지 있으면 그 페이지로 넘어가기 위한 변수
        img_url : 이미지 URL
        img_fname : 파일 이름으로 사용 
    */
    //다운 받은 파일과 다운 받지 못한 파일을 나눠야한다. 
    main_pageCount = 0;
    

    while(main_pageCount <= 60){
        var i = 0;
        var mainurl = main_page_url+main_pageCount;

        downloadFiletoUpload()
        //console.log(uploadFileArry);
        await mainPageFunc(mainurl);

        //console.log(main_page_list);
        //중복 검사 -> URL 검사 -> 문제 없으면 다운
        
        while(i < main_page_list.length)
        {  //main_page_list
            //파일 중복 검사 없으면 실행하고 있으면 종료
            if(!stringEquals(sourceFileName[i]))
            {   
                //URL 검사 image2 || blogspot 제거, list 길이 저장
                var SUrlPath = encodeURI(main_url+main_page_list[i]+list_url+list_Count);
                await imgPageFunc(fileName[i],SUrlPath)
                let listLength = (list.length)/2;
                //이미지 첫번째만 비교하면 된다. 
                let urlequals = img_url[0];
                
                //초기화  
                list = [];
                img_url = [];
                img_fname = [];
            
                if(!((urlequals.match(/.bp.blogspot+/g) == '.bp.blogspot') || (urlequals.match(/https:\/\/images2+/g) == "https://images2")))
                {   
                    fileDownloadLog(sourceFileName[i]);

                    console.log(urlequals);
                    console.log(fileName[i])
                    
                    while(list_Count <= listLength)
                    {
                        //이미지 추출 후 저장 
                        var SUrlPath = encodeURI(main_url+main_page_list[i]+list_url+list_Count);
                        var j=0;//url
                
                        await imgPageFunc(fileName[i],SUrlPath)

                        console.log("파일 이름 :"+savedir+fileName[i]);
                        console.log("디렉토리 이름 "+fileName[i]);
                        await createDir(savedir+fileName[i]);
           
                        while(j < img_url.length)//img_url
                        { 
                            console.log("이미지 파일 이름 "+img_fname[j]);
                            console.log("img URL: "+img_url[j])
                            await file_download(img_fname[j],savedir+fileName[i]+"/",img_url[j]);
                            j++;
                        }
                    list_Count++;
                    img_url = [];
                    img_fname = [];
                }
                }
                else {
                    console.log("다운 받지 못해 이름을 저장하겠습니다...");
                    console.log(sourceFileName[i]);
                    //await notDownloadImgName(sourceFileName[i]);
                }
            } else {
                console.log("데이터가 존재합니다.");
                console.log(sourceFileName[i]);
            }
            i++;
            //이미지 변수 일괄 초기화
            list = [];
            img_url = [];
            img_fname = [];
            list_Count = 1;
        }



        //이미지 변수 일괄 초기화
        img_fname = [];
        img_url = [];
        list = [];
        //파일 변수 일괄 초기화
        main_page_list = [];
        sourceFileName = [];
        fileName = [];
        main_pageCount += 20;
    }


}

//func();



