import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { ConfimModalComponent } from './shared/component/confim-modal/confim-modal.component';
import { UserInfoService } from './shared/service/user-info.service';
import { filter } from 'rxjs';
import { ListService } from './shared/service/list.service';
import { mapListPageFromHome } from './shared/function/globalFunction';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { NavigationService } from './shared/service/navigation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          transform: 'rotate(0)',
        })
      ),
      state(
        'closed',
        style({
          transform: 'rotate(90deg)',
        })
      ),
      transition('open => closed', [animate('0.3s')]),
      transition('closed => open', [animate('0.3s')]),
    ]),
    trigger('openCloseNavBar', [
      state(
        'open',
        style({
          left: '0px',
        })
      ),
      state(
        'closed',
        style({
          left: '-200px',
        })
      ),
      transition('open => closed', [animate('0.3s')]),
      transition('closed => open', [animate('0.3s')]),
    ]),
  ],
})
export class AppComponent implements OnInit {
  title = 'trainYourLife';

  public toggleMenu = false;

  public isLogged: boolean;

  public titlePage: string;

  public isNotifierOpen = false;

  public isLoginPage = true;

  constructor(
    private _userInfoService: UserInfoService,
    private _router: Router,
    private _modalService: MatDialog,
    private _listService: ListService,
    private _navigationService: NavigationService
  ) {}

  public ngOnInit(): void {
    this.isLogged = this._userInfoService.getIsLogged();

    this._userInfoService.isLoggedChangeEvent$.subscribe({
      next: (res) => (this.isLogged = res),
    });

    this._userInfoService.isCoachChangeEvent$.subscribe({
      next: (res) => (this.isLogged = res),
    });

    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((res) => {
        this.isLoginPage = (res as NavigationEnd).url.includes('login');

        this.titlePage = (res as NavigationEnd).url
          .split('/')[1]
          .replace('/', '')
          .replaceAll('_', ' ')
          .toUpperCase();
      });
  }

  public onHamburgerMenuClicked() {
    this.isNotifierOpen = false;
    this.toggleMenu = !this.toggleMenu;
  }

  public onNavbarItemClicked(valueEmitted: string) {
    this._listService.setPage(mapListPageFromHome(valueEmitted));
    valueEmitted = valueEmitted.replaceAll(' ', '_');
    if (valueEmitted === 'prenotazioni' && this._userInfoService.getIsCoach())
      this._router.navigate(['/' + valueEmitted + '/coach']);
    else this._router.navigate(['/' + valueEmitted]);
    this.toggleMenu = !this.toggleMenu;
  }

  public onNotifierclick(): void {
    this.toggleMenu = false;
    this.isNotifierOpen = !this.isNotifierOpen;
  }

  public onLogOutClick(): void {
    this._modalService
      .open(ConfimModalComponent, {
        height: '150px',
        width: '300px',
        data: {
          msgBody: 'Sicuro di voler uscire?',
          isSuccessfulModal: false,
        },
      })
      .afterClosed()
      .subscribe({
        next: (res) => {
          if (res) {
            res ? this._router.navigate([`/login`]) : null;
            this._userInfoService.setStorageServiceValue('isLogged', false);
            this.toggleMenu = false;
          }
        },
      });

    this._navigationService.savedRoutes = [
      { url: '/login', listPageData: this._listService.getPage() },
    ];
  }

  public onBackClick() {
    if (
      this._router.url.includes('progressi') &&
      !this._userInfoService.getIsCoach()
    ) {
      this._navigationService.savedRoutes = [
        { url: '/home', listPageData: this._listService.getPage() },
      ];
      this._router.navigate(['/home']);
    } else {
      if (!this.isLoginPage) this._navigationService.getPreviuousPage();
    }
  }
}
