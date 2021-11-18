import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor() { }

  getUserRole() {
    return 'employee'
  }

  getUserid(){
    return 7
  }
}
