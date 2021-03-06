import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { USER_ROLE } from "@shared/interfaces";
import { AlertsService } from '@app/services/alerts.service';
import { AuthenticationService } from "@appsrc/app/modules/_shared/services";

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private _authService: AuthenticationService, private _router: Router, private _alerts: AlertsService) {
    
  }

  canActivate() {
    console.log("AlwaysAuthGuard");
    let user = this._authService.getUser();
    if(!user) {
      this._alerts.create("error", "Log In first");
      this._router.navigate(["authenticate"]);
      return false;
    }
    if(user.roles.indexOf(USER_ROLE.USER) !== -1) {
      return true;
    }
  }
}