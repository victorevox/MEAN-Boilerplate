import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { NgForm } from "@angular/forms";
import { AlertsService } from '@app/services/alerts.service';
import { NotificationsService } from 'angular2-notifications';
import { AuthenticationService } from '@appsrc/app/modules/_shared/services';
import { Observable } from 'rxjs';

enum AUTH_TYPES {
  SIGNUP = "signup",
  LOGIN = "login",
  FACEBOOK = "facebook"
}

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: []
})
export class AuthenticationComponent implements OnInit {

  @ViewChild('form') form: NgForm;

  // private AUTH_TYPES 
  public auth_type = AUTH_TYPES.LOGIN;
  public title: string = "";

  constructor(
    private _router: Router,
    private _notifications: NotificationsService,
    private route: ActivatedRoute,
    private _authService: AuthenticationService,
    private _alerts: AlertsService,
    private _cDr: ChangeDetectorRef,
    private _alertService: AlertsService
  ) {
    this._router.routerState.root.queryParams.subscribe((params) => {
      let type = params["auth_type"];
      this.route;
      this._router;
      if (type) {
        console.log(type);
        switch (type) {
          case AUTH_TYPES.LOGIN:
            this.setupLogin();
            break;
          case AUTH_TYPES.SIGNUP:
            this.setupSignup();
            break;
          case AUTH_TYPES.FACEBOOK:
            if (!params) {
              this._alerts.create("error", "Error");
              return this.goLogin();
            }
            let token = params["token"];
            if (token) {
              this._authService.saveToken(token);
              this._notifications.success("Logged In");
              this._router.navigate(['profile']);
            }
            this.setupSignup();
            break;
          default:
            this.goLogin();
            break;
        }
      }
      console.log(params)
    });
  }

  ngOnInit() {
  }

  loginFacebook($event) {
    this._authService.loginFacebook();
  }

  submit(event: Event) {
    event.preventDefault();
    console.log(this.form);
    if (this.form.valid) {
      let observable: Observable<any>;

      switch (this.auth_type) {
        case AUTH_TYPES.LOGIN:
          observable = this._authService.loginByCredentials(this.form.value);
          break;
        case AUTH_TYPES.SIGNUP:
          observable = this._authService.signupByCredentials(this.form.value);
          break;

        default:
          break;
      }
      if (observable) {
        observable.subscribe(() => {
          switch (this.auth_type) {
            case AUTH_TYPES.LOGIN:
              this._router.navigate(["profile"])
              break;
            case AUTH_TYPES.SIGNUP:
              this._notifications.success("Great!", "You've been registered successfuly")
              break;

            default:
              break;
          }
          this._cDr.markForCheck();
        }, error => {
          const message = (error.error && error.error.message || error.error) || error && error.message || error
          this._notifications.error("Error", message);
        })
      }
    } else {
      this._alerts.create("error", "Please check that all fiedls are valid", "Invalid Form");
    }
    return console.log("Form invalid");
  }

  setupLogin() {
    this.auth_type = AUTH_TYPES.LOGIN;
    this.title = "Please Login";
  }

  setupSignup() {
    this.auth_type = AUTH_TYPES.SIGNUP;
    this.title = "Please Signup"
  }

  isLogin() {
    return this.auth_type === AUTH_TYPES.LOGIN;
  }

  goSignup() {
    console.log("To Signup");
    this._router.navigate(['authenticate'], { queryParams: { auth_type: "signup" } });
  }

  goLogin() {
    console.log("To Login");
    this._router.navigate(['authenticate'], { queryParams: { auth_type: "login" } });
  }

  isAuthenticated() {
    return this._authService.isAunthenticated();
  }

  changeType() {
    if (this.isLogin()) {
      return this.goSignup();
    } else {
      return this.goLogin();
    }
  }

}