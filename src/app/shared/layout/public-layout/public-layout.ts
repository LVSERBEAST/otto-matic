import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { filter } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [Header, Footer, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout {
  private readonly router = inject(Router);

  readonly showInitialScreen = signal(true);
  readonly showLogoStage = signal(false);
  readonly showEnterButton = signal(false);
  readonly showLandingPage = signal(false);
  readonly showLayout = signal(false);
  readonly adjustLogoZ = signal(false);

  ngOnInit() {
    this.initializeInkTransition();
    this.startEntrySequence();

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const logoStage = document.querySelector('.logo-stage');
      if (this.router.url !== '/') {
        logoStage?.classList.add('instant');
        this.showLogoStage.set(false);
      } else {
        this.showLogoStage.set(true);
      }
    });
  }

  ngOnDestroy() {
    if (typeof $ !== 'undefined') {
      $('.cd-modal-trigger').off();
      $('.modal-close').off();
      $(window).off('resize.inkAnimation');
    }
  }

  enterSite() {
    const logoStage = document.querySelector('.logo-stage') as HTMLElement;
    if (logoStage) {
      logoStage.style.backgroundColor = 'transparent';
    }

    this.triggerInkOut();
    this.showLayout.set(true);

    setTimeout(() => {
      this.showEnterButton.set(false);
      this.showLandingPage.set(true);
      this.adjustLogoZ.set(true);
    }, 800);
  }

  private startEntrySequence() {
    setTimeout(() => {
      this.triggerInkIn();
    }, 1000);
  }

  private triggerInkIn() {
    if (typeof $ === 'undefined') return;
    const transitionLayer = $('.cd-transition-layer');
    transitionLayer.addClass('visible opening');

    setTimeout(() => {
      this.showInitialScreen.set(false);
      this.showLogoStage.set(true);
      this.showEnterButton.set(true);
    }, 500);
  }

  private triggerInkOut() {
    if (typeof $ === 'undefined') return;

    const transitionLayer = $('.cd-transition-layer');
    const transitionBackground = transitionLayer.children();
    transitionLayer.addClass('closing');

    transitionBackground.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', () => {
      transitionLayer.removeClass('closing opening visible');
      transitionBackground.off('webkitAnimationEnd oanimationend msAnimationEnd animationend');
    });
  }

  showLogin() {
    if (typeof $ === 'undefined') return;

    const transitionLayer = $('.cd-transition-layer');
    const modalWindow = $('.cd-modal');

    transitionLayer.addClass('visible opening');

    setTimeout(() => {
      modalWindow.addClass('visible');
    }, 600);
  }

  loginAsAdmin() {
    this.closeModal();
    setTimeout(() => {
      this.router.navigate(['/app/dashboard']);
    }, 800);
  }

  loginAsDev() {
    this.closeModal();
    setTimeout(() => {
      this.router.navigate(['/app/dashboard']);
    }, 800);
  }

  private closeModal() {
    if (typeof $ === 'undefined') return;

    const transitionLayer = $('.cd-transition-layer');
    const modalWindow = $('.cd-modal');
    const transitionBackground = transitionLayer.children();

    transitionLayer.addClass('closing');
    modalWindow.removeClass('visible');

    transitionBackground.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', () => {
      transitionLayer.removeClass('closing opening visible');
      transitionBackground.off('webkitAnimationEnd oanimationend msAnimationEnd animationend');
    });
  }

  private initializeInkTransition() {
    if (typeof $ === 'undefined') {
      setTimeout(() => this.initializeInkTransition(), 100);
      return;
    }

    const transitionLayer = $('.cd-transition-layer');
    const transitionBackground = transitionLayer.children();
    const modalWindow = $('.cd-modal');

    const frameProportion = 1.78;
    const frames = 25;
    let resize = false;

    const setLayerDimensions = () => {
      const windowWidth = $(window).width();
      const windowHeight = $(window).height();
      let layerHeight: number, layerWidth: number;

      if (windowWidth / windowHeight > frameProportion) {
        layerWidth = windowWidth;
        layerHeight = layerWidth / frameProportion;
      } else {
        layerHeight = windowHeight * 1.2;
        layerWidth = layerHeight * frameProportion;
      }

      transitionBackground.css({
        width: layerWidth * frames + 'px',
        height: layerHeight + 'px',
      });

      resize = false;
    };

    setLayerDimensions();

    $(window).on('resize.inkAnimation', () => {
      if (!resize) {
        resize = true;
        if (!window.requestAnimationFrame) {
          setTimeout(setLayerDimensions, 300);
        } else {
          window.requestAnimationFrame(setLayerDimensions);
        }
      }
    });

    modalWindow.on('click', '.modal-close', (event: Event) => {
      event.preventDefault();
      this.closeModal();
    });
  }
}
