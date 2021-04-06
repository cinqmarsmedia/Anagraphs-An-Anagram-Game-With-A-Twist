import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { LaunchReview } from '@ionic-native/launch-review';

import { IonicStorageModule } from "@ionic/storage";


import { DeviceFeedback } from "@ionic-native/device-feedback";
import { TapticEngine } from "@ionic-native/taptic-engine";
import { DragulaModule, DragulaService } from 'ng2-dragula';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';


@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    DragulaModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    DeviceFeedback,
    TapticEngine,
    LaunchReview,
    SplashScreen,
     DragulaService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
