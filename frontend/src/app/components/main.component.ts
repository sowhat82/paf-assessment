import { HttpClient } from '@angular/common/http';
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
	}
	

	async share(){
		if (await this.auth.verifyLogin(this.auth.username, this.auth.password)){

			//post image to S3
			var digitalOceanKey = {}
			if(this.file != ""){
		
				const formData = new FormData();
				formData.set('image-file', this.file);
				digitalOceanKey = await this.http.post<any>('/uploadImage', formData).toPromise()  
			}
		
			else{
				digitalOceanKey = {}
			} 

		}
		else {
			window.alert('Credentials are not correct')
		}
	}
}
