import { Injectable, EventEmitter } from '@angular/core';
import { Http } from "@angular/http";
import { Response } from '@angular/http';
import { AlertsService } from '@jaspero/ng-alerts';
import { StorageService } from './storage.service';
import { IUser } from './../interfaces';

@Injectable()
export class AuthenticationService {

  private token_name = "access-token";
  public events: EventEmitter<IAuthenticationEvent> = new EventEmitter();

  constructor(private http: Http, private _alert: AlertsService, private _storageService: StorageService) {

  }

  signupByCredentials(credentials: ISignupCredentials): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post("/api/authentication/register", credentials).subscribe((response: Response) => {
        console.log(response.text());
        this.emit(AUTH_EVENT_TYPES.LOGIN)
        resolve();
      }, err => {
        reject();
        this.handleError(err);
      })  
    })
  }

  loginByCredentials(credentials: ILoginCredentials): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log("Login by credentials");
      this.http.post("/api/authentication/login", credentials).subscribe((response: Response) => {
        try {
          let body = <ILoginResponse>response.json();
          let token = body.token;
          this._storageService.setItem(this.token_name, token);
          console.log(token)
          this.emit(AUTH_EVENT_TYPES.SIGNUP);
          resolve();
        } catch (error) {
          reject();
          this._alert.create("error", "Something went wrong", "Error");
          console.log(response.text());
        }
      }, err => {
        reject()
        this.handleError(err);
      })
    })
  }

  isAunthenticated(): boolean {
    let user = this.getUser();
    if(user) {
      return true;
    } else {
      return false;
    }
  }

  logout() {
    this._storageService.removeItem(this.token_name);
    this.emit(AUTH_EVENT_TYPES.LOGOUT);
  }

  getToken(): string {
    return this._storageService.getItem(this.token_name);
  }

  getUser(): IUser {
    let token = this.getToken();
    if(!token) return null;
    let user: IUser = null;
    try {
      let string = atob(token.split('.')[1]);
      user = <IUser>JSON.parse(string);
      if(!user.username && user.email) {
        user.username = user.email;
      }
    } catch (err) {
      console.error(err);
    }
    return user;
  }

  handleError = (err: Error | Response) => {
    if(err instanceof Error) {
      console.log(err);
      this._alert.create("error", err.message, "Error");
    } else if( err instanceof Response ) {
      try {
        let error = err.json();
        console.log(error)
        this._alert.create("error", error.message? error.message : error, "Error");
      } catch (_err) {
        let error = err.toString();
        this._alert.create("error", error, "Error");
        console.log(error);
      }
    }
  }

  emit(eventType: AUTH_EVENT_TYPES) {
    this.events.emit(<IAuthenticationEvent>{type: eventType})
  }

}

export interface ILoginCredentials {
  email: string,
  password: string
}

export interface ISignupCredentials extends ILoginCredentials{
  confirmpassword: string,
  username: string
}

export interface ILoginResponse {
  token: string;
  message: string;
}

export enum AUTH_EVENT_TYPES {
  SIGNUP = "signup",
  LOGIN = "login",
  LOGOUT = "logout",
  UPDATE = "update"
}

export interface IAuthenticationEvent {
  type: AUTH_EVENT_TYPES
}