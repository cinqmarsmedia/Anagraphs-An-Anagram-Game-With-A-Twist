import { Component,ViewChild } from '@angular/core';
//import { NavController } from 'ionic-angular';
import { DragulaService } from "ng2-dragula";
import { wordlist } from "./../../constants";

import { DeviceFeedback } from "@ionic-native/device-feedback";
import { TapticEngine } from "@ionic-native/taptic-engine";

import { LaunchReview } from '@ionic-native/launch-review';
import { emailDomainBlacklist} from "./../../constants";
import { Storage } from "@ionic/storage";

import { AlertController, Platform, LoadingController } from "ionic-angular";

//import { AdMobFree, AdMobFreeBannerConfig, AdMobFreeRewardVideoConfig, AdMobFreeInterstitialConfig } from '@ionic-native/admob-free';

//import { wordlisttwo } from "./../../constants";

import { anagrams } from "./../../constants";
import { levels } from "./../../levels";
import { randLevels } from "./../../levels";

// Constants

export const unlockedLevelsShown=3;

declare const admob;

const iapID = "anagraphsfull";

const admobIDInter = {
  android: "androidAdMobID",
  ios: "iOSAdMobID",
};
const admobIDReward = {
  android: "androidAdMobID",
  ios: "iOSAdMobID",
};

const offlineAds=[

{title:"The Devil's Calculator", button:'Download Free', iOS:'https://itunes.apple.com/us/app/the-devils-calculator/id1447599858?ls=1&mt=8',android:'https://play.google.com/store/apps/details?id=com.cinqmarsmedia.devilscalc',icon:'dc',description:'An educational math puzzle game named one of the 10 best indies of 2019 by PAX'},
{title:"Lazy Chess", button:'Download Free', iOS:'https://itunes.apple.com/app/id1537358433',android:'https://play.google.com/store/apps/details?id=com.cinqmarsmedia.lazychess',icon:'lazychess',description:'An innovative new chess game where you choose between your two best moves each turn'},
{title:"PolitiTruth", button:'Download Free', iOS:'https://apps.apple.com/us/app/polititruth/id1217091559?ls=1',android:'https://play.google.com/store/apps/details?id=com.cinqmarsmedia.polititruth',icon:'polititruth',description:'a free, non-profit fake news quiz game sponsored by PolitiFact'},
{title:"The Birds Upstairs", button:'Watch', iOS:'https://www.youtube.com/embed/2rI_em4MscE?rel=0&autoplay=1',android:'https://www.youtube.com/embed/2rI_em4MscE?rel=0&autoplay=1',icon:'birds',description:'An award winning student oscar nominated short film'},
{title:"Word Unknown", button:'Download Free', iOS:'https://itunes.apple.com/us/app/word-unknown/id1064901570?mt=8&ign-mpt=uo%3D4',android:'https://play.google.com/store/apps/details?id=com.jarvisfilms.wordunknown',icon:'wordunknown',description:'An intelligent mix of hangman and Mastermind®'},
{title:"Synonymy", button:'Download Free', iOS:'https://apps.apple.com/us/app/synonymy/id924648807?ls=1',android:'https://play.google.com/store/apps/details?id=air.com.jarvisfilms.synonomy',icon:'syn',description:'An educational word game narrated by Richard Dawkins'}

]


//------------------------------


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
   queries: {
    content: new ViewChild('content')
  }
})



export class HomePage {
 // state:any={raw:[],order:[],transf:[],real:[],scored:[],possible:0,noshake:null}

currentLevel:any=-1;
numStars:any=0;
state:any=[];
demo:any=false;
holdPrompt:any=false;
newsletterSigned:any=false;
randThresh:any=20;
offlineAdIndex:any=0;
background:any={x:[],y:[],size:[],blur:[]}
game:any={startmoves:null,scored:[],possible:0,moves:null}
animate:any={greenlight:false,shake:null,legal:0}
adCounter:any=0;
levels:any=levels;
  onPauseSubscription: any;
addedStars:any=0;
bestMoves:any=[]//[1,1,1,1,1,1,1,1,1,1,1,1,1]
offset:any=0;
queuedLevels:any=[];
titleAnimInterval:any;
titleAnimSeed:any=0;
reviewed:any=false;
usePersonalisedAds: boolean = false;
shuffleMode:any={skip:0,completed:0}
donated:any=false;
promptConsent:any=false;
mobile:any
iOS:any=navigator.userAgent.match(/Mac|iPhone|iPad|iPod/i);
  loadingPop: any = this.loadingCtrl.create({
    content: "Please Wait",
    duration: 3000,
  });

//test:any=[null,null,'Level 1','b','c','d','e','f','g','y','3','5','f','d','s','f','a'].reverse()

  //temp:any=[];


   ionViewDidEnter(){

  }
  constructor(public dragulaService: DragulaService,public platform: Platform,
    public deviceFeedback: DeviceFeedback,
    public taptic: TapticEngine,private alertCtrl: AlertController,public launchReview:LaunchReview,public storage: Storage,public loadingCtrl: LoadingController) {


 if (this.platform.is("cordova") && !this.demo) {
      this.mobile = true;
    } else {
      this.mobile = false;
    }

        this.onPauseSubscription = this.platform.pause.subscribe((result) => {
      this.setData();
    });


 platform.ready().then(() => {
      if (window["cordova"] && window["cordova"].InAppBrowser) {
        window["open2"] = window["cordova"].InAppBrowser.open;
      }
      // this.startTimeout();
      if (this.platform.is("cordova")) {
        window["store"].register({
          id: iapID,
          type: window["store"].NON_CONSUMABLE,
        });

  

  window["store"].refresh()

      window["store"].when(iapID).approved((p) => {
          this.loadingPop.dismiss();
          this.donated=true;
          this.numStars=this.calcStars(true);
          this.thankyou();
          this.setData();
          p.finish();
        });
/**/


window["store"].when(iapID).owned(() => {
      let p = window["store"].get(iapID);
  if (p.owned && !this.donated) {
         this.donated=true; 
         this.numStars=this.calcStars(true);
      }
        this.loadingPop.dismiss();

      
    })
  }
})


    document.addEventListener("admob.reward_video.reward", () => {
      //console.log("reward vid successfully completed");
      this.loadingPop.dismiss();
      this.addedStars++
      this.numStars=this.calcStars();
      this.earnedStar()

      this.setData();
      //this.earnedUpgrade(false);
    });



    document.addEventListener("admob.reward_video.load_fail", ()=>{
      this.loadingPop.dismiss();
      this.videoFailed();
      // show something
    })


//this.loadLevel(0);//

this.titleAnimInterval=setInterval(()=>{
this.titleAnimSeed++ // damn
},600)
/**/
//console.log(this.state.real);

//console.log(this.printout);

 dragulaService.drop.subscribe((value) => {
   //console.log(value);
      this.checkWord()
    });


     
 dragulaService.drag.subscribe((value) => {
//if (this.game.moves<1){return}
     //console.log('boobobo');
    });


    dragulaService.setOptions('word', {
      moves: (el, source, handle, sibling) => (this.game.moves>0 || this.currentLevel>=999),
      direction: 'horizontal'
    });


}

 ionViewCanEnter(): Promise<any> {


  return new Promise((resolve, reject) => {


this.storage.get("anagraphs").then(val => {
  //console.log(val)
  if (val){
this.bestMoves=val.bestMoves;
this.addedStars=val.addedStars;
this.shuffleMode=val.shuffleMode;
this.reviewed=val.reviewed;
this.newsletterSigned=val.newsletterSigned;
this.donated=val.donated;
this.adCounter=val.adCounter;
this.offlineAdIndex=val.offlineAdIndex
this.promptConsent=val.promptConsent;
  }

this.lvlSel();

resolve(true)

})


     
    })

  }

    videoFailed(){
    let alert = this.alertCtrl.create({
      title: "Failed To Load Video",
      message:
        "Video Ads are not available right now, please try again later",
      buttons: [
        {
          text: "Ok",
          handler: () => {},
        },
      ],
    });

    alert.present();
  }

earnedStar() {
    var alert = this.alertCtrl.create({
      title: "1 Star Earned",
      enableBackdropDismiss: false,
      buttons: [
      {
          text: "Ok",
          handler: () => {
            this.numStars=this.calcStars();
          },
        
        }
         
      ],
    });
    alert.present();
  }

    thankyou() {
    var alert = this.alertCtrl.create({
      title: "Full Game Unlocked",
      enableBackdropDismiss: false,
      message: "Thank you for your donation to our non-profit and for your support. Follow us on social media and sign-up for our newsletter for updates and launch discounts on new projects!",
      buttons: [
      {
          text: "Dismiss",
          handler: () => {
            this.numStars=this.calcStars(true);
          },
        
        },
      {
          text: "Newsletter",
          handler: () => {
            this.numStars=this.calcStars(true);
            this.newsletterPop();
          }
        }
         
      ],
    });
    alert.present();
  }

cmm(){
   var adAlert = this.alertCtrl.create({
      title: "Our Non-Profit",
      enableBackdropDismiss: false,
       subTitle: "Sign-Up for our newsletter or check out our other free apps and projects on our website!",
      message: "Cinq-Mars Media is a 501(c)3 devoted to education and social advocacy through technology",
     
      buttons: [
        {
          text: "No Thanks",
          handler: (data) => {
          },
        },
        {
          text: "Newsletter",
          handler: (data) => {
            this.newsletterPop()
          },
        },
        {
          text: "Website",
          handler: (data) => {
     window["open2"]('https://cinqmarsmedia.com','_blank')
          },
        },
      ],
    });

    adAlert.present();
}


  moves(){
    if (this.currentLevel==0){
      return;
    }

    if (this.currentLevel>=999){
      if (this.game.moves!==0){
         this.undo(false,true);
      }
      return;
    }
/*
    titleStars+='<img class="modalStar full animat pulsenormal infinite" src="assets/star.svg">'
}else{
 titleStars+='<img class="modalStar full" src="assets/star.svg">'
}
}else{
 titleStars+='<img class="modalStar" src="assets/star.svg">'
}
*/

var breakdown=['<img class="MinimodalStar full animat pulsenormal infinite" src="assets/star.svg"><img class="MinimodalStar" src="assets/star.svg">','<img class="MinimodalStar full animat pulsenormal infinite" src="assets/star.svg"><img class="MinimodalStar full animat pulsenormal infinite" src="assets/star.svg">'];



if (this.levels[this.currentLevel].moves.length==3){
breakdown[0]=breakdown[0]+'<img class="MinimodalStar" src="assets/star.svg">'
breakdown[1]=breakdown[1]+'<img class="MinimodalStar" src="assets/star.svg">'
breakdown[2]='<img class="MinimodalStar full animat pulsenormal infinite" src="assets/star.svg"><img class="MinimodalStar full animat pulsenormal infinite" src="assets/star.svg"><img class="MinimodalStar full animat pulsenormal infinite" src="assets/star.svg">'


}




var fullBreakdown=breakdown[0]+'&nbsp;&nbsp; <b>'+this.levels[this.currentLevel].moves[0]+'</b> or less moves<br>'+breakdown[1]+'&nbsp;&nbsp; <b>'+this.levels[this.currentLevel].moves[1]+'</b> or less moves';



if (this.levels[this.currentLevel].moves.length==3){
  fullBreakdown=fullBreakdown+'<br>'+breakdown[2]+'&nbsp;&nbsp; <b>'+this.levels[this.currentLevel].moves[2]+'</b> or less moves'
}

     var adAlert = this.alertCtrl.create({
     // title: "Our Non-Profit",
      enableBackdropDismiss: false,
       subTitle: "Get more stars by completing the puzzle in fewer moves!",
      message: '<div style="text-align:left">'+fullBreakdown+'</div>',
     
      buttons: [
      {
          text: "Restart Level",
          handler: (data) => {
            this.choose(this.currentLevel)
          },
        },
        {
          text: "Ok",
          handler: (data) => {},
        },
      ],
    });

    adAlert.present();
  }


  freePlay(){
if (this.numStars<this.randThresh){
  this.videoPrompt();
}else{

// load randomLevel

// random levels are in order of easiest to hardest "randLevels" is array 

this.loadRand() // just picking 0, should be random(ish) index


}
  }


  loadRand(skip:any=false){
this.currentLevel=999;


if (this.shuffleMode.skip==0 && this.shuffleMode.completed==0){


var alert = this.alertCtrl.create({
      title: 'Open Play Mode',
      enableBackdropDismiss: false,
      subTitle: "You Get Unlimited Moves!",
      message: "Puzzles are randomly generated and assigned based on past success!",
      buttons: [
        {
          text: "Got It",
          handler: (data) => {
          },
        },
      ],
    });

alert.present()



}

if (skip){
this.shuffleMode.skip++
if (this.shuffleMode.skip%3==0){
  this.showInterAd();
}
}

var pow=this.shuffleMode.skip-this.shuffleMode.completed*3;

if (pow<0){
pow=1/Math.abs(pow);
}

if (pow==0){pow=1}

//this.game.id=levelIndex;
  var word=randLevels[Math.floor(Math.pow(Math.random(),pow)*randLevels.length)];

this.game={startmoves:0,scored:[],possible:this.computeAnswers(word),moves:0}
this.fillBckRand();
// process the word, replace it with all false state for flips or whatever

word.split('').forEach((l,i)=>{
  
  var trans=this.sanitize(l)
  var flipped=false;


if (trans!==l){
  flipped=true
}

  this.state[i]={letter:trans,flip:flipped?1:0} //,index:i
}); // process

this.game.history={state:[],moves:[],scored:[],pullWord:{}};
this.pushHistory();

}


showRewardVid(){
     if (!window.navigator.onLine) {
              this.noInternet();
              return;
            }


    if (!this.mobile) {
   //alert("reward video!")

this.addedStars++
this.numStars=this.calcStars();
      this.setData(); 

 return;
    }


    this.loadingPop.present();

    if (typeof admob !== "undefined") {
      admob.rewardVideo
        .load({
          id: admobIDReward,
        })
        .then(() => admob.rewardVideo.show());
    }
  


}

demoPrompt(){
      let alert = this.alertCtrl.create({
      title: "Anagraphs Demo",
      message:"Thank you for trying our demo! The game releases <b>April 6th</b> on iOS and Android. Sign up for our non-profit's newsletter to be notified!",
      buttons: [
        {
          text: "Later",
          handler: () => {},
        },
        {
          text: "Sign Up",
          handler: () => {
            this.newsletterPop()
          },
        }
      ],
    });
    alert.present();

}

 noInternet() {
    let alert = this.alertCtrl.create({
      enableBackdropDismiss: false,
    });
    alert.setTitle("Please Connect to Internet");
    alert.setMessage(
      "You must have an internet connection to use this feature"
    );

    alert.addButton({
      text: "Ok",
      handler: (data) => {},
    });

    alert.present();
  }

videoPrompt(){

if (this.demo){
  this.demoPrompt();
  return;
}

  if (!this.promptConsent && this.platform.is("cordova")){
    this.showConsents();
  }

  var buttons=[];


if (this.donated){
buttons.push(  {
          text: "No Thanks",
          handler: (data) => {
          },
        });
}else{

buttons.push({
      text: "Restore Donation",
          handler: (data) => {
            if (window.navigator.onLine) {
              if (this.mobile) {
                this.loadingPop.present();
                window["store"].refresh()
              } else {
            
                alert("Restore Purchase") 
              }
            } else {
              this.noInternet();
            }
          }})

}



 buttons.push(    
        {
          text: "Watch Video for 1 Star",
          handler: (data) => {
  
  this.showRewardVid();
            //this.showInterAd();
          },
        })


  if (!this.donated){

   



    buttons.push(

    {
      text: "Donate for 10 Stars & Ad Free",
          handler: (data) => {
            if (window.navigator.onLine) {
              if (this.mobile) {
                this.loadingPop.present();
                window["store"].order(iapID);
              } else {
                /*
          this.donated=true;
          this.numStars=this.calcStars();
          this.thankyou();
          this.setData();
          */
               alert("Show Purchase Dialogue")             
              }
            } else {
              this.noInternet();
            }
          }})
  }
   var adAlert = this.alertCtrl.create({
      title: "Non-Profit Mission",
      enableBackdropDismiss: true,
      subTitle: "Support our Educational Non-Profit",
      message: "By Watching a quick ad, you can support our 501(c)3 and earn a star. You can also make a small donation and earn 10 stars along with an ad free experience. Getting stars in these ways are not necessary to complete the game, but does make things much easier!",
      buttons: buttons,
    });

    adAlert.present();
}

nonNullLen(arr){
  var len=0;

arr.forEach((val)=>{
if (val!==null){
len++
}
})
console.log(len);
return len
}

setData(){
  this.storage.set("anagraphs",{bestMoves:this.bestMoves,addedStars:this.addedStars,reviewed:this.reviewed,shuffleMode:this.shuffleMode,donated:this.donated,adCounter:this.adCounter,offlineAdIndex:this.offlineAdIndex,promptConsent:this.promptConsent,newsletterSigned:this.newsletterSigned});
}

choose(i){

  if (this.levels[i].reqStars>this.numStars){
    this.videoPrompt();
  }else{

this.loadLevel(i);
this.currentLevel=i;
//this.openWinModal(); // DEBUG 
  }

}

calcOffset(){
this.offset=this.nonNullLen(this.bestMoves)+unlockedLevelsShown;
}


lvlSel(){
  this.currentLevel=-1;
this.numStars=this.calcStars();
this.calcOffset();
  this.queueLevels(this.numStars);
}

queueLevels(stars){
  const showLevelsAbove=0;

var temp=[];//null,null

this.levels.forEach((lvl)=>{
  if (stars+showLevelsAbove>=lvl.reqStars){
    temp.push(lvl)
  }
})
console.log(temp);

this.queuedLevels=temp.reverse();

}

calcStars(donated:any=false){
var stars=0;

//console.log(this.bestMoves);

this.bestMoves.forEach((moves,i)=>{
//  console.log(moves);
stars+=this.numStarsLvl(moves,i);
})

stars+=this.addedStars;
if (this.donated || donated){
  stars+=10;
}

if (this.demo){
  stars+=1;
}
//console.log(stars);
return stars;

}

loadLevel(levelIndex){

if (this.demo && levelIndex>6){
this.demoPrompt()
return;
}

if (levelIndex>1 && !this.promptConsent && this.mobile && !this.donated){
  this.showConsents();
}
//this.game.id=levelIndex;
  var word=this.levels[levelIndex].letters;
  var moves=this.levels[levelIndex].moves;

this.state=[];
this.game={startmoves:moves,scored:[],possible:this.computeAnswers(word),moves:moves[0]}
this.fillBckRand();
// process the word, replace it with all false state for flips or whatever

word.split('').forEach((l,i)=>{
  
  var trans=this.sanitize(l)
  var flipped=false;


if (trans!==l){
  flipped=true
}

  this.state[i]={letter:trans,flip:flipped?1:0} //,index:i
}); // process

this.game.history={state:[],moves:[],scored:[],pullWord:{}};
this.pushHistory();

}

dist(x1,x2,y1,y2){
  return Math.sqrt(Math.pow((x2-x1),2)+Math.pow((y2-y1),2))
}

fillBckRand(){
  for (let i=0;i<20;i++){
/**/
for (let j=0;j<20;j++){
  var x=this.randInt(0,60);
  var y=this.randInt(20,80);
  //var y=80;
var tooClose=false;

for (let p=0;p<i;p++){
var dist=this.dist(x,this.background.x[p],y,this.background.y[p])
//console.log(dist)
if (dist<15/Math.pow(i,.1)){
  tooClose=true;
}
}
//console.log(j);
if ((y>60 || y<40) && !tooClose){j=20}

}


this.background.x.push(x)
this.background.y.push(y)
var size=this.randInt(6,17)
this.background.size.push(size)
this.background.blur.push((this.randInt(5,12)+size/4)/12) // function of size above?
  }

}

apticCall(type:any=3){

  if (this.mobile){
  setTimeout(()=>{
this.deviceFeedback.haptic(type);
this.taptic.selection();
},0)

}
}

randInt(lower,upper){
  return Math.floor(Math.random() * (upper - lower + 1) + lower);
}

undoHistory(){

this.game.history.state=this.game.history.state.slice(0,-1);
this.game.history.moves=this.game.history.moves.slice(0,-1);
this.game.history.scored=this.game.history.scored.slice(0,-1);

}

pushHistory(){
this.game.history.state.push(JSON.parse(JSON.stringify(this.state)));
this.game.history.moves.push(this.game.moves);
this.game.history.scored.push(JSON.parse(JSON.stringify(this.game.scored)));
}

processWord(state){
var word='';

this.holdPrompt=false;

  state.forEach((item)=>{
if (item.flip){
word+=this.transform(item.letter);
}else{
  word+=item.letter
}

  })
  return word
}

jumpBack(word){

var index=this.game.history.pullWord[word]+1

// slice history based on index, then deepclone back below


this.game.history.state=this.game.history.state.slice(0,index);
this.game.history.moves=this.game.history.moves.slice(0,index);
this.game.history.scored=this.game.history.scored.slice(0,index);


this.state=JSON.parse(JSON.stringify(this.game.history.state[this.game.history.state.length-1]));
this.game.moves=this.game.history.moves[this.game.history.moves.length-1];
this.game.scored=JSON.parse(JSON.stringify(this.game.history.scored[this.game.history.scored.length-1]));
/*
*/

}

areYouSure(){
var alert = this.alertCtrl.create({
      title: 'Exit Level?',
      enableBackdropDismiss: false,
      subTitle: 'Progress Will Not Be Saved',
      //message: "You solved the puzzle in <b>"+moves+ "</b> moves"+(better?', <b>'+(oldMoves-moves)+'</b> better then your previous best!':''),
      buttons: [
        {
          text: "cancel",
          handler: (data) => {
          }

        },
        {
          text: "Exit",
          handler: (data) => {
this.lvlSel();
          },
        },
      ],
    });

alert.present()
}

undo(force:any=false,really:any=false){

if (this.currentLevel>=999 && !really){
  this.lvlSel();
  return;
}

if (this.game.history.state.length==1 || force){
this.currentLevel=-1
  return
}
  this.holdPrompt=true;
this.game.history.state.pop();
this.game.history.moves.pop();
this.game.history.scored.pop();

this.state=JSON.parse(JSON.stringify(this.game.history.state[this.game.history.state.length-1]));
this.game.moves=this.game.history.moves[this.game.history.moves.length-1];
this.game.scored=JSON.parse(JSON.stringify(this.game.history.scored[this.game.history.scored.length-1]));

}

checkWord(){

  setTimeout(()=>{

 var word=this.processWord(this.state);
//console.log(this.game.moves); //()()
if (typeof wordlist[word.length] == 'undefined'){
//console.log('word undefined?');
  return}

  var success=wordlist[word.length].includes(word);

if (success){

  if (!this.game.scored.includes(word)){
  this.game.scored.push(word);
  this.apticCall();
/*
  for (var i=0;i<20;i++){
    this.game.scored.push('testing');
  }
  */
 this.game.history.pullWord[word]=this.game.history.moves.length;
  //this.animate.score=true;
 // console.log(word); //()()
 }
   this.animate.legal++
 
//this.pushHistory()
}

if (JSON.stringify(this.game.history.state[this.game.history.state.length-2])==JSON.stringify(this.state)){
this.game.moves++

this.undoHistory()

}else{




if(this.currentLevel<999){
  this.game.moves--
}else{
  this.game.moves++
}

this.pushHistory()
//console.log(this.state);
if (this.game.scored.length==this.game.possible){
    this.openWinModal();
  }




}
},0)
}


numStarsLvl(moves,i){
var stars=0;

if (moves<=this.levels[i].moves[0]){
  stars++
}
if (moves<=this.levels[i].moves[1]){
  stars++
}if (moves<=this.levels[i].moves[2]){
  stars++
}
return stars
}


titleStar(oldStars,newStars,addStars,len){
var titleStars

if (oldStars==0){
titleStars='<img class="modalStar full animat pulsenormal infinite" src="assets/star.svg">';
}else{
titleStars='<img class="modalStar full" src="assets/star.svg">';
}

if (len==1){
return titleStars
}


if (newStars>1){

  if (addStars>1 || oldStars==1 && newStars==2){
titleStars+='<img class="modalStar full animat pulsenormal infinite" src="assets/star.svg">'
}else{
 titleStars+='<img class="modalStar full" src="assets/star.svg">'
}

if (len==2){
return titleStars
}

if (newStars>2){

  if (oldStars!==3){
titleStars+='<img class="modalStar full animat pulsenormal infinite" src="assets/star.svg">'
}else{
 titleStars+='<img class="modalStar full" src="assets/star.svg">'
}
}else{
 titleStars+='<img class="modalStar" src="assets/star.svg">'
}

}else{

  titleStars+='<img class="modalStar" src="assets/star.svg">'
  
if (len==2){
return titleStars
}
  titleStars+='<img class="modalStar" src="assets/star.svg">'
}



return titleStars
}


openWinModal(){
  if (this.currentLevel>=999){
this.shuffleMode.completed++

  this.showInterAd();

    this.loadRand()
    return;
  }
let id = this.game.id
let moves = this.levels[this.currentLevel].moves[0]-this.game.moves

//this.bestMoves[this.currentLevel]=23
//moves=18; // debug

var oldMoves=-1;
var oldStars=0;
var newStars=this.numStarsLvl(moves,this.currentLevel)


if (this.bestMoves[this.currentLevel]){
oldMoves=this.bestMoves[this.currentLevel];
oldStars=this.numStarsLvl(oldMoves,this.currentLevel)
}


var addStars=newStars-oldStars;


let titleStars='<div class="textCenter">'+this.titleStar(oldStars,newStars,addStars,this.levels[this.currentLevel].moves.length)+'</div>'


//let totalStars=; // 0,1,2

// add Stars
var better=false;

if (moves<oldMoves && oldMoves!==-1){
better=true;
}

if (better || oldMoves==-1){
  this.bestMoves[this.currentLevel]=moves;
  this.setData()
//this.calcStars();
}

var subTitle

if (addStars==0){

if (oldStars==this.levels[this.currentLevel].moves.length){
subTitle="Play other levels to earn more stars"
}else{
  var improv=this.bestMoves[this.currentLevel]-this.levels[this.currentLevel].moves[oldStars+1]


if (isNaN(improv)){
  improv=this.bestMoves[this.currentLevel]-this.levels[this.currentLevel].moves[oldStars]
}

  subTitle="Improve your record by <b>"+ improv +"</b> move"+(improv>1?"s":"")+" to earn another star";

}

}else if (addStars>0){
subTitle="You got "+addStars+" new star"+(addStars>1?'s':'')+(addStars>0?'!':'');
}else{
  subTitle="You did not meet or exceed your best score";
}


var alert = this.alertCtrl.create({
      title: titleStars,
      enableBackdropDismiss: false,
      subTitle: subTitle,
      message: "You solved the puzzle in <b>"+moves+ "</b> moves"+(better?', <b>'+(oldMoves-moves)+'</b> better than your previous best!':''),
      buttons: [
        {
          text: "Retry",
          handler: (data) => {
            this.loadLevel(this.currentLevel);
          }

        },
        {
          text: "Level Select",
          handler: (data) => {

this.showInterAd();

this.lvlSel();
          },
        },
      ],
    });

alert.present()


}

alphabetize(word) {
    if (!word) {
        return;
    }
    word = word.split('');
    word = word.sort();
    word = word.join('');
    return word;
}

numAnagrams(alpha){
//console.log(anagrams[alpha.length][alpha]);


if (typeof anagrams[alpha.length][this.alphabetize(alpha)] !== 'undefined'){
  return anagrams[alpha.length][this.alphabetize(alpha)];
}else{
  return 0;
}


}


wordCombinations(word){
var original=this.alphabetize(word).split('');
var combos=[this.alphabetize(word)]
  // return array of all combinations, ALPHABATIZE
var replaceLetters:any=['d','b','u','m','r','e','h'];
var indexes=[];
var instructions=[];

/**/
var cycles=0;
original.forEach((letter,i)=>{
  if (replaceLetters.includes(letter)){
cycles++;
indexes.push(i);
  }
})
//alert(cycles);


for (let i=1;i<Math.pow(2,cycles)+1;i++){
//console.log(i)
var binaryToAdd=i.toString(2);

for (let p=0;p<indexes.length;p++){
  if (binaryToAdd.length==cycles){
      instructions.push(binaryToAdd)
      break
  }
  binaryToAdd='0'+binaryToAdd;
}

}

instructions.forEach((permutation)=>{
  var newcombo=JSON.parse(JSON.stringify(original));

permutation.split('').forEach((bool,d)=>{

if (bool==1){
newcombo[indexes[d]]=this.transform(original[indexes[d]])

}
})

combos.push(this.alphabetize(newcombo.join('')))

})

  return combos
}

sanitize(word){
var sanitized=word.replace(/p/g,'d');
sanitized=sanitized.replace(/q/g,'b');
sanitized=sanitized.replace(/n/g,'u');
sanitized=sanitized.replace(/w/g,'m');
sanitized=sanitized.replace(/j/g,'r');
sanitized=sanitized.replace(/a/g,'e');
sanitized=sanitized.replace(/y/g,'h');
return sanitized;
}

computeAnswers(word){
var counter=0;
var countedCombos:any=[];

var combos=this.wordCombinations(this.sanitize(word));
for (let i=0;i<combos.length;i++){

  if (!countedCombos.includes(combos[i])){
    //console.log(combos[i]);
    countedCombos.push(combos[i])
  var numAna=this.numAnagrams(combos[i]);

  if (numAna>0){
      //console.log(combos[i]+','+numAna);
  counter+=this.numAnagrams(combos[i]);
  }
  }
}

//console.log(counter);

return counter
//this.state.possible=counter;
//alert(counter);
//this.printout+=word+","+counter+'\r\n'

}

transform(letter){

if (letter=='d'){
  return 'p'
  }else if (letter=='p'){
  return 'd'
  }else if (letter=='b'){
    return 'q'
  }else if (letter=='q'){
  return 'b'
  }else if (letter=='u'){
    return 'n'
  }else if (letter=='n'){
  return 'u'
  }else if (letter=='m'){
    return 'w'
  }else if (letter=='w'){
   return 'm'
  }else if (letter=='j'){
    return 'r'
  }else if (letter=='r'){
    return 'j'
  }else if (letter=='a'){
  return 'e'
  }else if (letter=='e'){
    return 'a'
  }else if (letter=='y'){
    return 'h'
  }else if (letter=='h'){
    return 'y'
  }else{
    return letter;
  }

}

rotate(i){

if (this.game.moves<1){return}
/*
//var orig=this.state.raw[i];
var curr=this.state.real[i];
//console.log(orig);
this.state.real[i]=this.transform(this.state.real[i]);

if (curr==this.state.real[i]){
  // can't transform
  this.state.noshake=i;
  setTimeout(()=>{this.state.noshake=null;},500)
}else{
  // we transformed
 this.state.transf[i]=!this.state.transf[i];
 this.checkWord()
}
*/

this.animate.greenlight=true;
setTimeout(()=>{
  this.animate.greenlight=false;
},500)

if (this.state[i].letter!==this.transform(this.state[i].letter)){
if (this.state[i].flip==0){
  this.state[i].flip=1;
}else{
  this.state[i].flip=0;
}
this.checkWord();
  //this.state[i].flip=!this.state[i].flip
}else{
  this.state[i].flip=2;
setTimeout(()=>{
 this.state[i].flip=0;
},500)


  // can't transform, shake
}



}

jsonBest(){

  var ansDB={};
  var arr:any=[];
  var print='';

for (let i=6;i<7;i++){

ansDB[String(i)]={};

Object.keys(anagrams[String(i)]).forEach((a)=>{

var san=this.alphabetize(this.sanitize(a));

if (!arr.includes(san)){
arr.push(san);
ansDB[String(i)][san]=anagrams[String(i)][a];
}else{
ansDB[String(i)][san]=ansDB[String(i)][san]+anagrams[String(i)][a];
}

})
/**/
Object.keys(ansDB[String(i)]).forEach((p)=>{

var possibilities=0;
var spec=0;
spec+=p.split("d").length - 1;
spec+=p.split("b").length - 1;
spec+=p.split("u").length - 1;
spec+=p.split("m").length - 1;
spec+=p.split("r").length - 1;
spec+=p.split("e").length - 1;
spec+=p.split("h").length - 1;

function factorial(n) {
  return n ? n * factorial(n - 1) : 1;
}



possibilities=factorial(p.length);

if (spec>0){
  possibilities=possibilities*Math.pow(2,spec);
}
ansDB[String(i)][p]=String(ansDB[String(i)][p])+','+String(possibilities);



//var example='';
/*
for (let h=0;h<wordlist[String(i)].length;h++){

  if (this.alphabetize(this.sanitize(wordlist[String(i)][h]))==p){
    example=wordlist[String(i)][h];
  }
  break;
}
*/
var examples=[];
wordlist[String(i)].forEach((x)=>{
  if (this.alphabetize(this.sanitize(x))==p){
    examples.push(x);
  }
})

//print='';
print+=p+','+p.length+','+ansDB[String(i)][p]+','+JSON.stringify(examples)+'\n';


})

//ansDB[String(i)].sort();

}




//console.log(JSON.stringify(ansDB[]));
//console.log(print);
}



  ratingPop(){

     let alert = this.alertCtrl.create({
    title: 'Please Rate and Review',
    message: 'If you are enjoying the game, please rate and/or review. Your feedback helps expose the project to others',
    buttons: [
      {
        text: 'Later',
        //role: 'cancel',
        handler: () => {

        }
      },
      {
        text: 'Ok',
        handler: () => {
          //if (this.mobile){
              this.launchReview.launch().then((result) => {
                  this.reviewed=true;
                  this.setData();
              });
            

        }
      }
    ]
  });
  alert.present();
  }

  promptRating(){

  // fallback?
if(this.launchReview.isRatingSupported()){
  this.launchReview.rating()
}else{
this.ratingPop();
}


}

newsletterPop(){

var message="<b>Get special launch discounts and keep up with our non-profit!</b> Unsubscribe anytime.";
var title="Email Sign-Up";

//message+=" Note: As you have already signed up once, you are not eligible for another star.";
if (!this.newsletterSigned){

  message+=" You will need to verify ownership of your email with a disposable code.";
  title+=" and 1 Star!";
}

let alert = this.alertCtrl.create({
      title: title,
      message: message,
        inputs: [
      {
        name: 'email',
        placeholder: 'Your Email'
      }
      
    ],
      buttons: [
        {
          text: "Later",
          //role: 'cancel',
          handler: () => {},
        },
        {
          text: "Ok!",
          handler: (data) => {

if (!window.navigator.onLine){
  this.pop("No Internet","Please try again when you have a connection")
  return;
}
var postAt=data.email.match(/@(.+)/i)

if (/(.+)@(.+){2,}\.(.+){2,}/.test(data.email) && data.email.length>7 && postAt && !emailDomainBlacklist.includes(postAt[1])){

fetch("<email sub link>", {
    method: "POST",
    mode: 'no-cors',
headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  },
    body: "EMAIL="+data.email,
  });

if (!this.newsletterSigned){
this.addedStars++
this.numStars=this.calcStars();
this.earnedStar()
this.setData();
}
this.newsletterSigned=true;

}else{
 // alert('please enter a valid email');
 alert.setMessage(message+'<br><span class="red">Please Enter a Valid Email</span>')
  return false
}


          },
        },
      ],
    });
    alert.present();

  }

pop(title,txt) {
    let alert = this.alertCtrl.create({
      title: title,
      message:txt,
      buttons: [
        
        {
          text: "Ok",
          handler: () => {},
        },
      ],
    });
    alert.present();
  }


  showInterAd(){


this.adCounter++

if (this.adCounter<4 || this.adCounter%2==1){
return;
}
console.log(this.adCounter);
if (this.adCounter%10==0 && !this.reviewed){
this.promptRating();
  return;
}

if (this.adCounter%17==0 && !this.newsletterSigned){
this.newsletterPop();
  return;
}

if (this.donated){return}
if (!this.mobile){alert('inter ad');return}

 if (window.navigator.onLine){


       if (typeof admob !== "undefined") {
      admob.interstitial
        .load({
          id: admobIDInter,
        })
        .then(() => admob.interstitial.show());
    }

 }else{
   this.showOfflineAd()
 }



  }


    showOfflineAd(){

var ad=offlineAds[this.offlineAdIndex];

let alertWin = this.alertCtrl.create({
      title: ad.title,
       enableBackdropDismiss: false,
      //subTitle: ad.subTitle,
      message:'<img class="adIcon" src="assets/ads/'+ad.icon+'.png">'+ad.description,
      buttons: [
        {
          text: "No Thanks",
          //role: 'cancel',
          handler: () => {},
        },
        {
          text: ad.button,
          handler: () => {
            var url=this.iOS?ad.iOS:ad.android;
              window["open2"](url,"_system");
          },
        },
      ],
    });
    alertWin.present();

   if (offlineAds.length-1==this.offlineAdIndex){
this.offlineAdIndex=0;
   }else{
        this.offlineAdIndex++  
   }
 
  }

jsonPrintout(){
  var anaDB={};
  var convDB={};
  var print;

for (let i=3;i<13;i++){

anaDB[String(i)]=[];

wordlist[String(i)].forEach((a)=>{

anaDB[String(i)].push(this.alphabetize(a))
})

anaDB[String(i)].sort();

}

for (let i=3;i<13;i++){

convDB[String(i)]={};

anaDB[String(i)].forEach((a)=>{
if (typeof convDB[String(i)][a] == 'undefined'){


var counter=0;

anaDB[String(i)].forEach((b)=>{
  if (b==a){counter++}
})


  convDB[String(i)][a]=counter;
}
})
}
//console.log(JSON.stringify(convDB))
//print+='"'+i+'":['

//this.printout=JSON.stringify(convDB);
}



async showConsents() {
    const consent = window["consent"];
    if (!this.promptConsent){
      this.promptConsent=true;
         this.setData();
    }
    

    //if nonEU, just get the ios14 consent and return...
    let isEU: boolean = await consent.isRequestLocationInEeaOrUnknown();
    if (!isEU) {
      //show ios consent if needed
      this.usePersonalisedAds = true;
      if (window["device"] && window["device"].platform == "iOS") {
        try {
          await this.showIos14Consent();
          console.log("ios 14 consent shown successfully");
          return;
        } catch (err) {
          console.error(err);
          return -1;
        }
      }
      return;
    }

    //EU - check for GDPR first, and then asked for consent if allowed by the user.
    try {
      let res = await this.showGDPRConsent();
      console.log("GDPR consent shown successfuly", res);
      if (res == "PERSONALIZED") {
        console.log("personalised ads approved from gdpr");
        this.usePersonalisedAds = true;
        if (window["device"] && window["device"].platform == "iOS") {
          await this.showIos14Consent();
          console.log("ios 14 consent shown successfully");
        }
      }
      return;
    } catch (err) {
      console.error(err);
      return -1;
    }
  }

  async showIos14Consent() {

if (parseFloat(window["device"].version)<14){return}

    const consent = window["consent"];
    try {
      return await consent.requestTrackingAuthorization();
    } catch (err) {
      console.error(err);
      return -1;
    }


  }

  async showGDPRConsent() {
    const consent = window["consent"];
    const publisherIds = ["PubID"];

    //uncomment the below two lines to simulate EU region, maybe...
    // await consent.addTestDevice('33BE2250B43518CCDA7DE426D04EE231')
    // await consent.setDebugGeography('EEA')

    console.log(await consent.checkConsent(publisherIds));
    const ok = await consent.isRequestLocationInEeaOrUnknown();
    console.log("from eu or unknown - ", ok);

    const form = new consent.Form({
      privacyUrl: "https://policies.google.com/privacy",
      adFree: false,
      nonPersonalizedAds: true,
      personalizedAds: true,
    });

    await form.load();
    const result = await form.show();
    return result;
  }

}
