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
  @Input('height') _contentHeight: number;
  @Input('user') user: any;


  loading: any;
  private allRequirementsMet: boolean = false;
  private groupRequirements: any;
  private _noConfirm: boolean = false; //set to true if the group contains the requirement.$key 'noconfirm'
  private _name: string;
  private _isAMember: boolean = false;
  private _hasApplied: boolean = false;

  public active: boolean = false;

  private _members: Array<any> = [];
  private _memberSelected: any;

  private groupOffers: Array<any> = [];
  private _offerSelected: any;
  private groupWants: Array<any> = [];

  private _view: string = 'offers';

  private _headerIcon: string = 'arrow-dropdown';

  constructor(private notificationsService: NotificationsService, private newsService: NewsService, private userService: UserService, public modalCtrl: ModalController, private _db: AngularFireDatabase, private _loadingCtrl: LoadingController) {
  }

  selectMember(member) {
    this._memberSelected = member;
  }

  selectOffer(offer) {
    this._offerSelected = offer;
  }

  buyOffer() {
    let circleModal = this.modalCtrl.create(PurchaseModal, { offer: this._offerSelected });
    circleModal.present().then( (result) => {
      this._offerSelected = null;
    });
  }

  joinGroup() {
    if (this.allRequirementsMet) {
      if (this._noConfirm) {
        this.loading = this._loadingCtrl.create({
          content: 'Joining group...'
        });
        this.loading.present();
        this.group.members.push(this.user.key);
        this._db.object('/groups/' + this.group.$key).update({ members: this.group.members }).then( () => {
          this.notificationsService.create('Join Success','','success');
          this.newsService.addGroupJoin(this.group);
          let msg = 'You have joined the group: ' +this.group.displayName;
          this.notificationsService.create('Join', msg, 'info');
          this.loading.dismiss();
        });
      }
      else {
        this.loading = this._loadingCtrl.create({
          content: 'Applying to join group...',
          duration: 2000
        });
        this.loading.present();
        // application pending code
        this._hasApplied = true;
      }
    }
  }

  selectedOffers() {
    this._view = 'offers';
  }

  selectedWants() {
    this._view = 'wants';
  }

  toggleShowGroup() {
    this.active = !this.active;
    this._headerIcon = (this.active) ? 'arrow-dropup' : 'arrow-dropdown';
  }

  assignRequirementCompletion(requirement: any) {
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
        this._noConfirm = false;
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
    console.log(requirement.$key, requirement.isComplete)
  }

  ngOnInit() {
    //first setup group card vars
    this._name = this.group.displayName;

    //todo: seems inefficient
    this.group.members.map(member => {
      this._db.object('/users/' + member).take(1).subscribe( (member) => {
        if (member.$exists()) {
            this._members.push(member);
            if (member.offers) {
              for (let i in member.offers) {
                //todo: do this better
                member.offers[i].sellerKey = member.$key;
                this.groupOffers.push(member.offers[i]);
              }
            }
        }
        else
          console.error('member missing in DB, key:', member.$key);
      })
    });

    //user.$key is equivalent to user.uid
    this._isAMember = this.group.members.includes(this.user.$key);

    this.groupRequirements = this.allRequirements.map(reqs =>
      reqs.filter(req => {
        if (req.$key == 'noconfirm') {
          this._noConfirm = true;
          return false;
        }
        if (this.group.requirements.includes(req.$key)) {
          this.assignRequirementCompletion(req);
          return this.group.requirements.includes(req.$key);
        }
        return false;
      }));

    this.groupRequirements
      .map(reqs => reqs.every((req) => req.isComplete))
      .subscribe(result => {
        this.allRequirementsMet = result;
      });
  }

}
