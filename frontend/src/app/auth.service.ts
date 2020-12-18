import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()

export class Auth {

    username = ""
    password = ""
    constructor(private http: HttpClient){}
    
    async verifyLogin(username: string, password:string){
        var success = false; 
        const loginData = new HttpParams()
        .set('username', username)
        .set('password', password)
    
        const httpHeaders = new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')

        await this.http.post('/login', loginData, {headers: httpHeaders}).toPromise().then(
            function() {
              // success callback
      //        window.alert("Success")
              success = true
            },
            function(response) {
              // failure callback,handle error here
              // response.data.message will be "This is an error!"
      
              console.log(response)
              window.alert("Invalid user")
              success = false
            }
        )

        return (success)
    }
            
}


