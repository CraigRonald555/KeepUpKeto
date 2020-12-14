import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router, CanActivateChild } from "@angular/router";
import { Observable, TimeoutError } from "rxjs";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { AngularFireAuth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private authService: AuthService, private router: Router, private afAuth: AngularFireAuth) {


  }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    return this.afAuth.authState.pipe(map(user => {

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


    }));

    // return this.afAuth.currentUser.then(user => {

    //   if (user) {

    //     console.log("AuthGuard - User is logged in");
    //     console.log(user);
    //     return true;

    //   } else {

    //     console.log("AuthGuard - User is null");
    //     console.log(user);
    //     this.router.navigate(['/landing']);
    //     return false;

    //   }

    // });

  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.canActivate(route, state);

  }

}
