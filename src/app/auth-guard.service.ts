import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router, CanActivateChild } from "@angular/router";
import { Observable, TimeoutError } from "rxjs";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private authService: AuthService, private router: Router, private afAuth: AngularFireAuth) {


  }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    // console.log('afAuth.authState value:');
    // console.log(this.afAuth.authState);

    // let status = false;

    // if (this.afAuth.currentUser) {

    //   status = true;
    //   console.log(this.afAuth.currentUser);

    // } else {

    //   status = false;
    //   console.log(this.afAuth.currentUser);
    //   this.router.navigate(['/landing']);

    // }

    return this.afAuth.authState.toPromise().then(user => {

      if (user) {

        console.log("AuthGuard - User is logged in");
        console.log(user);
        return true;

      } else {

        console.log("AuthGuard - User is null");
        console.log(user);
        this.router.navigate(['/landing']);
        return false;

      }

    });

  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.canActivate(route, state);

  }

}
