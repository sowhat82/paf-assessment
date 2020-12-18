import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../auth.service';
import {CameraService} from '../camera.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

	mainForm : FormGroup
	imagePath = '/assets/cactus.png'
	file: any

	constructor(private cameraSvc: CameraService, private fb: FormBuilder, private auth: Auth, private http: HttpClient) { }

	ngOnInit(): void {
	  if (this.cameraSvc.hasImage()) {
		  const img = this.cameraSvc.getImage()
			this.imagePath = img.imageAsDataUrl
		}

	  this.mainForm = this.fb.group({
		// image: this.fb.control('', [Validators.required]),
		title: this.fb.control('', [Validators.required]),
		comments: this.fb.control('', [Validators.required]),
	  })

	}

	clear() {
		this.imagePath = '/assets/cactus.png'
		this.mainForm.reset()
	}
	
	async share(){
		if (await this.auth.verifyLogin(this.auth.username, this.auth.password)){

			//post image to S3
			// var digitalOceanKey = {}
			// if(this.file != ""){
		
			// 	const formData = new FormData();
			// 	formData.set('image-file', this.file);
			// 	digitalOceanKey = await this.http.post<any>('/uploadImage', formData).toPromise()  
			// }
		
			// else{
			// 	digitalOceanKey = {}
			// } 

			const body = new HttpParams()
			.set('title', this.mainForm.get('title').value)
			.set('comments', this.mainForm.get('comments').value)
		
			const httpHeaders = new HttpHeaders()
			.set('Content-Type', 'application/x-www-form-urlencoded')
		
			await this.http.post('/share', body, {headers: httpHeaders}).toPromise().then(
				function() {
				  // success callback
				//   window.alert(response.error.message)
				},
				function(response) {
				  // failure callback,handle error here
				  // response.data.message will be "This is an error!"
					window.alert(response.error.message)
				}
			  )
		this.clear()
		}
		else {
			window.alert('Credentials are not correct')
		}
	}
}
