import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';
import { IsActiveMatchOptions } from '@angular/router';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  @ViewChild('drawer') drawer!: MatSidenav;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, private router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, false);
  }

  async handleSidenavItemClick(): Promise<void> {
    const isHandset = await this.isHandset$.pipe(take(1)).toPromise();
    if (isHandset) {
      this.drawer.close();
    }
  }

  toggleDrawer() {
    this.drawer.toggle();
  }
}
