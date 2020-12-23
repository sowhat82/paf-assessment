import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()

export class Auth {

    username = ""
    password = ""
    constructor(private http: HttpClient){}
    
    async verifyLogin(username: string, password:string){
        var success = false;
        var status = 0
        const loginData = new HttpParams()
        .set('username', username)
        .set('password', password)
    
        const httpHeaders = new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')

        // "observe response" to obtain the status code in the result object
        await this.http.post('/login', loginData, {headers: httpHeaders, observe: 'response'}).toPromise().then(
            function(result) {
              // success callback
              success = true
              status = result.status
              // this.username = username
              // this.password = password
            },
            function(result) {
              // failure callback,handle error here
              // response.data.message will be "This is an error!"
              status = result.status
              window.alert("Invalid user " + status.toString())
              success = false
            }
        )

        return (status)
    }
            
}


