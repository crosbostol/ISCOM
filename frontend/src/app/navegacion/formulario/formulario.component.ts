
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from 'src/app/services/api.service';
@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class FormularioComponent implements OnInit {
  form: FormGroup;
  constructor(public fb: FormBuilder, private http: HttpClient, private apiService : ApiService) {
    this.form = this.fb.group({
      inventory_id: [''],

    });
  }
  ngOnInit() {}

  submitForm() {
    var formData: any = new FormData();
    formData.append('inventory_id', this.form.get('inventory_id')!.value);
    console.table(this.form)
    this.apiService.postInventory(this.form.value)
      .subscribe({
        next: (response) => console.log(response),
        error: (error) => console.log(error),
      });
  }


}
