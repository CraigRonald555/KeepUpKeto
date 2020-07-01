import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { stringify } from 'querystring';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedIn = false;

  constructor(private afAuth: AngularFireAuth, private router: Router, private http: HttpClient) {


  }

  SignUp(email, password) {

    const credentials = { email, password};

    this.http.post('http://localhost:3000/api/user', credentials)
      .subscribe(response => {

        console.log(response);

      },
      error => {

        console.log('Email already used');

      });

    // return this.afAuth.createUserWithEmailAndPassword(email, password)
    //   .then((result) => {
    //     window.alert('You have been successfully registered!');
    //     console.log(result.user);
    //   }).catch((error) => {
    //     window.alert(error.message);
    //   });
  }

  // Sign in with email/password
  SignIn(email, password) {

    // return this.afAuth.signInWithEmailAndPassword(email, password)
    //   .then((result) => {
    //      this.router.navigate(['/homepage']);
    //      this.loggedIn = true;
    //   }).catch((error) => {
    //     window.alert(error.message);
    //   });
  }

}
