import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';

import { CatalogStore } from './application/state/catalog/catalog.store';
import { CartStore } from './application';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from "./shared/components/notification/notification.component";


@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet, NotificationComponent],
  providers: [CatalogStore, CartStore],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App { }