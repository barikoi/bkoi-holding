import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HoldingService {

  apiUrl = 'http://urban.barikoi.com:4100/v1/api/holding';

  constructor( private http: HttpClient) { }

  getHoldings() {
    return this.http.get(this.apiUrl);
  }
}
