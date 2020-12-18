import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Auth } from '../auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm : FormGroup
	errorMessage = ''

	constructor(private fb: FormBuilder, private router: Router, private http: HttpClient, private auth: Auth) { }

	ngOnInit(): void { 
    this.loginForm = this.fb.group({
      username: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required]),
    })
  }

  async login(){

    var success = true;

    const username = this.loginForm.get('username').value
    const password = this.loginForm.get('password').value

    if (await this.auth.verifyLogin(username, password) == true){
      console.info('yes')
      this.auth.username = this.loginForm.get('username').value
      this. auth.password = this.loginForm.get('password').value
      this.router.navigate(['/capture'])
    }
    else{
      console.info('no')
      this.errorMessage = "Invalid user"
    }

  }
}
