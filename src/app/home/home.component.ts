import { Component, OnInit } from '@angular/core';
import { ImporterService } from '../services/importer.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private imporService: ImporterService
  fileLocation = ""
  file: File
  amount: number

  constructor(service: ImporterService) {
    this.imporService = service
  }

  ngOnInit(): void {
  }

  onFileSelected(event) {
    this.file = event.target.files[0];

    if (this.file) {
      this.fileLocation = this.file.path;
    }
  }

  loadFile() {
    const loc = this.fileLocation ? this.fileLocation : "C:\\Users\\Coen\\Desktop\\Summoners War Exporter Files\\Helldembez-9776772.json"
    this.amount = this.imporService.import(loc)
  }

  clear() {
    this.imporService.clear()
    delete this.amount
  }

  clean() {
    this.imporService.clean()
  }
}