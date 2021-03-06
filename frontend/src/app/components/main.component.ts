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
	img: any
	

	constructor(private cameraSvc: CameraService, private fb: FormBuilder, private auth: Auth, private http: HttpClient) { }

	ngOnInit(): void {

		if (this.cameraSvc.hasImage()) {
		  const img = this.cameraSvc.getImage()
		  this.img = img
		  this.imagePath = img.imageAsDataUrl
		}
		// console.info(this.img.imageData)	

	  this.mainForm = this.fb.group({
		// image: this.fb.control('', [Validators.required]),
		title: this.fb.control('', [Validators.required]),
		comments: this.fb.control('', [Validators.required]),
	  })

	}

	clear() {
		this.img = null
		this.cameraSvc.clear()
		this.imagePath = '/assets/cactus.png'
		this.mainForm.reset()
	}
	
	async share(){
		if (await this.auth.verifyLogin(this.auth.username, this.auth.password)){

			// post image to S3
			// var imageUpload = false
			const formData = new FormData();
			formData.set('image-file', this.img.imageData)
			
			const params = new HttpParams()
			.set('title', this.mainForm.get('title').value)
			.set('comments', this.mainForm.get('comments').value)

			await this.http.post<any>('/share', formData, {params: params}).toPromise().then(
				function(response) {
				  // success callback
					window.alert(`Post uploaded. ID:  ${response['ops'][0]._id}`)					
			},
				function(response) {
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
