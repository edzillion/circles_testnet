import { Component, Input } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { LoadingController, ModalController } from 'ionic-angular';

import { PurchaseModal } from '../../pages/purchase-modal/purchase-modal'

import { UserService } from '../../providers/user-service/user-service';
import { NewsService } from '../../providers/news-service/news-service';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'group-card',
  templateUrl: 'group-card.html'
})
export class GroupCard {

  @Input('group') group: any;
  @Input('requirements') allRequirements: FirebaseListObservable<any>;
  @Input('height') contentHeight: number;

  private user: any;

  private loading: any;
  private allRequirementsMet: boolean = true;
  private groupRequirements: any;
  private noConfirm: boolean = false; //set to true if the group contains the requirement.$key 'noconfirm'
  private name: string;
  private isAMember: boolean = false;
  private hasApplied: boolean = false;

  public active: boolean = false;

  private members: Array<any> = [];
  private memberSelected: any;

  private groupOffers: Array<any> = [];
  private offerSelected: any;
  private groupWants: Array<any> = [];

  private view: string = 'offers';

  private headerIcon: string = 'arrow-dropdown';

  constructor(private notificationsService: NotificationsService, private newsService: NewsService, private userService: UserService, public modalCtrl: ModalController, private db: AngularFireDatabase, private loadingCtrl: LoadingController) {

    userService.userSubject.subscribe(
      user => this.user = user,
      err => console.error(err),
      () => {}
    );
  }

  selectMember(member) {
    this.memberSelected = member;
  }

  selectOffer(offer) {
    this.offerSelected = offer;
  }

  buyOffer() {
    let circleModal = this.modalCtrl.create(PurchaseModal, { offer: this.offerSelected });
    circleModal.present().then( (result) => {
      this.offerSelected = null;
    });
  }

  joinGroup() {
    if (this.allRequirementsMet) {
      if (this.noConfirm) {
        this.loading = this.loadingCtrl.create({
          content: 'Joining group...'
        });
        this.loading.present();
        this.group.members.push(this.user.$key);
        this.db.object('/groups/' + this.group.$key).update({ members: this.group.members }).then( () => {
          this.newsService.addGroupJoin(this.group);
          this.loading.dismiss();
        });
      }
      else {
        this.loading = this.loadingCtrl.create({
          content: 'Applying to join group...',
          duration: 2000
        });
        this.loading.present();
        // application pending code
        this.hasApplied = true;
      }
    }
  }

  selectedOffers() {
    this.view = 'offers';
  }

  selectedWants() {
    this.view = 'wants';
  }

  toggleShowGroup() {
    this.active = !this.active;
    this.headerIcon = (this.active) ? 'arrow-dropup' : 'arrow-dropdown';
  }

  assignRequirementCompletion(requirement: any) : boolean {
    switch (requirement.$key) {
      case "email": {
        requirement.isComplete = (this.user.email != '');
      };
        break;
      case "facebook": {
        requirement.isComplete = false;
      };
        break;
      case "google": {
        requirement.isComplete = false;
      };
        break;
      case "name": {
        requirement.isComplete = (this.user.displayName != '');
      };
        break;
      case "passport": {
        requirement.isComplete = false;
      };
        break;
      case "photo": {
        requirement.isComplete = (this.user.profilePicURL != '');
      };
        break;
      case "review": {
        requirement.isComplete = false;
        this.noConfirm = false;
      };
        break;
      case "soundcloud": {
        requirement.isComplete = false;
      };
        break;
      case "steam": {
        requirement.isComplete = false;
      };
        break;
    };
    return requirement.isComplete;
  }

  ngOnInit() {

    this.name = this.group.displayName;

    this.group.members.map(member => {
      this.db.object('/users/' + member).take(1).subscribe(
        member => {
          if (member.$exists()) {
            this.members.push(member);
            if (member.offers) {
              for (let i in member.offers) {
                member.offers[i].seller = member.$key;
                this.groupOffers.push(member.offers[i]);
              }
            }
          }
          else {
            console.error('member missing in DB, key:', member.$key);
          }
        },
        err => console.error('firebase error:', err),
        () => {}
      )
    });

    this.isAMember = this.group.members.includes(this.user.$key);

    this.groupRequirements = this.allRequirements.map( reqs =>
      reqs.filter( req => {
        if (req.$key == 'noconfirm') {
          this.noConfirm = true;
          return false;
        }
        else if (this.group.requirements.includes(req.$key)) {
          //if one is not completed then all req's not met
          if (!this.assignRequirementCompletion(req))
            this.allRequirementsMet = false;
          return this.group.requirements.includes(req.$key);
        }
        return false;
      }));
  }
}
